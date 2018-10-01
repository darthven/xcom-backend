import axios from 'axios'
import * as fs from 'fs'
import * as converter from 'xml-js'

import { ChequeRequest } from '../common'
import { MANZANA_CASH_URL } from '../config/env.config'
import logger from '../config/logger.config'
import { CHEQUE_REQUEST, ChequeRequestModel, ChequeResponseModel } from './soapDefinitions'

interface SoapHeaders {
    'user-agent'?: string
    'Content-Type'?: string
    soapAction?: string
}

export default class SoapUtil {
    public static async sendRequestFromXml(
        url: string,
        xml: string,
        headers?: SoapHeaders
    ): Promise<ChequeResponseModel> {
        return this.sendRequest(url, xml, headers)
    }

    public static async sendRequestFromFile(
        url: string,
        pathToXml: string,
        headers?: SoapHeaders
    ): Promise<ChequeResponseModel> {
        return this.sendRequest(url, this.getXmlRequestDataFromFile(pathToXml), headers)
    }

    public static updateObjectValue<T>(property: string, value: T, object: any, index?: number): void {
        for (const key in object) {
            if (key === property) {
                object[key] = value
                break
            } else if (index && object[key] instanceof Array) {
                object[key][index][property] = value
                break
            } else if (object[key] instanceof Object) {
                this.updateObjectValue(property, value, object[key], index)
            }
        }
    }

    public static addObjectProperty<T>(property: string, value: T, object: any, parentProperty: string): void {
        for (const key in object) {
            if (key === parentProperty) {
                object[key][property] = value
                break
            } else if (object[key] instanceof Object) {
                this.addObjectProperty(property, value, object[key], parentProperty)
            }
        }
    }

    public static createChequeRequest(chequeRequest: ChequeRequest): string {
        const data: ChequeRequestModel = CHEQUE_REQUEST
        this.updateObjectValue('ChequeType', chequeRequest.type, data)
        this.updateObjectValue('CardNumber', chequeRequest.cardNumber, data)
        this.updateObjectValue('DateTime', new Date().toISOString(), data)
        this.updateObjectValue('OperationType', chequeRequest.operationType, data)
        for (const [index, item] of chequeRequest.items.entries()) {
            this.updateObjectValue('PositionNumber', item.id, data, index)
            this.updateObjectValue('Article', item.article, data, index)
            this.updateObjectValue('Quantity', item.count, data, index)
            this.updateObjectValue('Price', item.price, data, index)
            this.updateObjectValue('Discount', 0, data, index)
            this.updateObjectValue('Summ', item.summ, data, index)
            this.updateObjectValue('SummDiscounted', item.summ, data, index)
        }
        this.updateObjectValue('Summ', chequeRequest.summ, data)
        this.updateObjectValue('Discount', 0, data)
        this.updateObjectValue('SummDiscounted', chequeRequest.summ, data)
        this.updateObjectValue('PaidByBonus', chequeRequest.paidByBonus || 0, data)
        if (chequeRequest.type === 'Fiscal') {
            this.addCoupons(chequeRequest, data)
        }
        // console.log('REQUEST', converter.js2xml(data, { compact: true }))
        return converter.js2xml(data, { compact: true })
    }

    private static addCoupons(chequeRequest: ChequeRequest, data: any) {
        if (chequeRequest.coupons) {
            this.addObjectProperty(
                'Coupons',
                {
                    Coupon: [
                        {
                            Number: {
                                _text: chequeRequest.coupons[0].number
                            }
                        },
                        {
                            EmissionId: {
                                _text: chequeRequest.coupons[1].emissionId
                            }
                        },
                        {
                            TypeId: {
                                _text: chequeRequest.coupons[2].typeId
                            }
                        }
                    ]
                },
                data,
                'ChequeRequest'
            )
        }
    }

    private static async sendRequest(url: string, data: string, headers?: SoapHeaders): Promise<ChequeResponseModel> {
        const { response } = await this.soapRequest(url, data, headers)
        const { body, statusCode } = response
        logger.info(statusCode)
        logger.info(body)
        return converter.xml2js(body, { compact: true, alwaysChildren: true }) as ChequeResponseModel
    }

    private static getXmlRequestDataFromFile(path: string): string {
        return fs.readFileSync(path, 'utf-8')
    }

    private static async soapRequest(url: string, xml: string, headers?: SoapHeaders): Promise<any> {
        return new Promise((resolve, reject) => {
            axios({
                method: 'post',
                url,
                headers,
                data: xml
            })
                .then(response => {
                    resolve({
                        response: {
                            body: response.data,
                            statusCode: response.status
                        }
                    })
                })
                .catch(error => {
                    reject(error.response.data)
                })
        })
    }
}

// const obj = {
//     a: {
//         b: 'dssd',
//         c: {
//             items: [
//                 {
//                     q: 100
//                 },
//                 {
//                     q: 101
//                 },
//                 {
//                     q: 102
//                 }
//             ]
//         }
//     }
// }

// SoapUtil.updateObjectValue<number>('q', 324, obj, 1)
// SoapUtil.addObjectProperty('inner', { _text: 'test' }, obj, 'c')

// console.log(JSON.stringify(obj, null, 4))

// SoapUtil.sendRequestFromFile(MANZANA_CASH_URL, './request.xml', {
//     'Content-Type': 'text/xml'
// }).catch(err => logger.error(err))
