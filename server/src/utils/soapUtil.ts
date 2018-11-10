import axios from 'axios'
import * as fs from 'fs'
import { Service } from 'typedi'
import * as converter from 'xml-js'

import { ChequeRequest } from '../common/chequeRequest'
import logger from '../config/logger.config'
import { CHEQUE_REQUEST, ChequeRequestModel, ChequeResponseModel, Coupons, Item } from './soapDefinitions'

interface SoapHeaders {
    'user-agent'?: string
    'Content-Type'?: string
    soapAction?: string
}

@Service()
export default class SoapUtil {
    // public async sendRequestFromXml(url: string, xml: string, headers?: SoapHeaders): Promise<ChequeResponseModel> {
    //     return this.sendRequest(url, xml, headers)
    // }
    //
    // public async sendRequestFromFile(
    //     url: string,
    //     pathToXml: string,
    //     headers?: SoapHeaders
    // ): Promise<ChequeResponseModel> {
    //     return this.sendRequest(url, this.getXmlRequestDataFromFile(pathToXml), headers)
    // }
    //
    // public updateObjectValue<T>(property: string, value: T, object: any, index?: number): void {
    //     for (const key in object) {
    //         if (key === property) {
    //             object[key] = value
    //             break
    //         } else if (index && object[key] instanceof Array) {
    //             object[key][index][property] = value
    //             break
    //         } else if (object[key] instanceof Object) {
    //             this.updateObjectValue(property, value, object[key], index)
    //         }
    //     }
    // }
    //
    // public addObjectProperty<T>(property: string, value: T, object: any, parentProperty: string): void {
    //     for (const key in object) {
    //         if (key === parentProperty) {
    //             object[key][property] = value
    //             break
    //         } else if (object[key] instanceof Object) {
    //             this.addObjectProperty(property, value, object[key], parentProperty)
    //         }
    //     }
    // }
    //
    // public createChequeRequest(chequeRequest: ChequeRequest, type: string): string {
    //     const data: ChequeRequestModel = { ...CHEQUE_REQUEST }
    //     // console.log(JSON.stringify(data, null, 4))
    //     this.updateObjectValue<number>('RequestID', Math.round(Math.random() * (1100 - 1000) + 1000), data)
    //     this.updateObjectValue<string>('ChequeType', type, data)
    //     this.updateObjectValue<string>('CardNumber', chequeRequest.cardNumber, data)
    //     this.updateObjectValue<string>('DateTime', new Date().toISOString(), data)
    //     this.updateObjectValue<string>('OperationType', 'Sale', data)
    //     this.updateObjectValue<number>('Summ', chequeRequest.summ, data)
    //     this.updateObjectValue<number>('Discount', 0, data)
    //     this.updateObjectValue<number>('SummDiscounted', chequeRequest.summ, data)
    //     this.updateObjectValue<number>('PaidByBonus', chequeRequest.paidByBonus || 0, data)
    //     this.addItems(chequeRequest, data)
    //     if (chequeRequest.coupons) {
    //         this.addCoupons(chequeRequest, data)
    //     }
    //     // console.log('REQUEST', converter.js2xml(data, { compact: true }))
    //     return converter.js2xml(data, { compact: true })
    // }
    //
    // private addItems(chequeRequest: ChequeRequest, data: any): void {
    //     const items: Item[] = []
    //     for (const item of chequeRequest.items) {
    //         items.push({
    //             PositionNumber: {
    //                 _text: item.id.toString()
    //             },
    //             Article: {
    //                 _text: item.article
    //             },
    //             Quantity: {
    //                 _text: item.count.toString()
    //             },
    //             Price: {
    //                 _text: item.price.toString()
    //             },
    //             Discount: {
    //                 _text: '0'
    //             },
    //             Summ: {
    //                 _text: item.summ.toString()
    //             },
    //             SummDiscounted: {
    //                 _text: item.summ.toString()
    //             }
    //         })
    //     }
    //     this.addObjectProperty<{ Item: Item[] }>(
    //         'Items',
    //         {
    //             Item: items
    //         },
    //         data,
    //         'ChequeRequest'
    //     )
    // }
    //
    // private addCoupons(chequeRequest: ChequeRequest, data: any): void {
    //     this.addObjectProperty<Coupons>(
    //         'Coupons',
    //         {
    //             Coupon: [
    //                 {
    //                     Number: {
    //                         _text: chequeRequest.coupons![0].number
    //                     }
    //                 },
    //                 {
    //                     EmissionId: {
    //                         _text: chequeRequest.coupons![1].emissionId
    //                     }
    //                 },
    //                 {
    //                     TypeId: {
    //                         _text: chequeRequest.coupons![2].typeId
    //                     }
    //                 }
    //             ]
    //         },
    //         data,
    //         'ChequeRequest'
    //     )
    // }
    //
    // private async sendRequest(url: string, data: string, headers?: SoapHeaders): Promise<ChequeResponseModel> {
    //     const { response } = await this.soapRequest(url, data, headers)
    //     const { body, statusCode } = response
    //     logger.info(statusCode)
    //     logger.info(body)
    //     return converter.xml2js(body, { compact: true, alwaysChildren: true }) as ChequeResponseModel
    // }
    //
    // private getXmlRequestDataFromFile(path: string): string {
    //     return fs.readFileSync(path, 'utf-8')
    // }
    //
    // private async soapRequest(url: string, xml: string, headers?: SoapHeaders): Promise<any> {
    //     return new Promise((resolve, reject) => {
    //         axios({
    //             method: 'post',
    //             url,
    //             headers,
    //             data: xml
    //         })
    //             .then(response => {
    //                 resolve({
    //                     response: {
    //                         body: response.data,
    //                         statusCode: response.status
    //                     }
    //                 })
    //             })
    //             .catch(error => {
    //                 reject(error.response.data)
    //             })
    //     })
    // }
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
