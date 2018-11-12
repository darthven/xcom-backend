import axios from 'axios'
import * as fs from 'fs'
import { HttpError } from 'routing-controllers'
import { Inject, Service } from 'typedi'
import * as converter from 'xml-js'
import { ChequeRequest } from '../common/chequeRequest'
import { SoftChequeRequest } from '../common/softChequeRequest'
import logger from '../config/logger.config'
import { EcomService } from '../ecom/ecomService'
import { ManzanaCheque } from '../manzana/manzanaCheque'
import { CHEQUE_REQUEST, ChequeRequestModel, ChequeResponseModel, Coupons, Item } from './soapDefinitions'
import { isArray } from 'util';

interface SoapHeaders {
    'user-agent'?: string
    'Content-Type'?: string
    soapAction?: string
}

@Service()
export default class SoapUtil {
    @Inject()
    private ecomService!: EcomService

    public async sendRequestFromXml(url: string, xml: string, headers?: SoapHeaders): Promise<ManzanaCheque> {
        const response: ChequeResponseModel = await this.sendRequest(url, xml, headers)
        const data = response['soap:Envelope']['soap:Body'].ProcessRequestResponse.ProcessRequestResult.ChequeResponse
        console.log(JSON.stringify(response, null, 4))
        if (data.Message._text !== 'OK') {
            throw new HttpError(parseInt(data.ReturnCode._text, 10), data.Message._text)
        }
        const items: Item[] = isArray(data.Item) ? data.Item : [data.Item]
        return {
            chargedBonus: data.ChargedBonus ? parseFloat(data.ChargedBonus._text) : 0,
            chargedStatusBonus: data.ChargedStatusBonus ? parseFloat(data.ChargedStatusBonus._text) : 0,
            writeOffBonus: data.WriteoffBonus ? parseFloat(data.WriteoffBonus._text) : 0,
            writeOffStatusBonus: data.ChargedStatusBonus ? parseFloat(data.ChargedStatusBonus._text) : 0,
            activeChargedBonus: data.ActiveChargedBonus ? parseFloat(data.ActiveChargedBonus._text) : 0,
            activeChargedStatusBonus: data.ActiveChargedStatusBonus
                ? parseFloat(data.ActiveChargedStatusBonus._text)
                : 0,
            amount: data.SummDiscounted ? parseFloat(data.Summ._text) : 0,
            discount: data.Discount ? parseFloat(data.Discount._text) : 0,
            basket: items.map(item => {
                return {
                    price: parseFloat(item.Price._text),
                    amount: parseFloat(item.SummDiscounted._text),
                    discount: parseFloat(item.Discount._text)
                }
            })
        }
    }

    public async sendRequestFromFile(
        url: string,
        pathToXml: string,
        headers?: SoapHeaders
    ): Promise<ChequeResponseModel> {
        return this.sendRequest(url, this.getXmlRequestDataFromFile(pathToXml), headers)
    }

    public updateObjectValue<T>(property: string, value: T, object: any, index?: number): void {
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

    public addObjectProperty<T>(property: string, value: T, object: any, parentProperty: string): void {
        for (const key in object) {
            if (key === parentProperty) {
                object[key][property] = value
                break
            } else if (object[key] instanceof Object) {
                this.addObjectProperty(property, value, object[key], parentProperty)
            }
        }
    }

    public async createSoftChequeRequest(chequeRequest: SoftChequeRequest): Promise<string> {
        const data: ChequeRequestModel = { ...CHEQUE_REQUEST }
        this.updateObjectValue<number>('RequestID', Math.round(Math.random() * (1100 - 1000) + 1000), data)
        this.updateObjectValue<string>('ChequeType', 'Soft', data)
        this.updateObjectValue<string>('CardNumber', chequeRequest.loyaltyCard, data)
        this.updateObjectValue<string>('DateTime', new Date().toISOString(), data)
        this.updateObjectValue<string>('OperationType', 'Sale', data)
        this.updateObjectValue<number>('Discount', 0, data)
        this.updateObjectValue<number>('PaidByBonus', 0, data)
        await this.addItems(chequeRequest, data)
        if (chequeRequest.coupons && chequeRequest.coupons.length > 0) {
            console.log(chequeRequest.coupons)
            this.addCoupons(chequeRequest, data)
        }
        const result = converter.js2xml(data, { compact: true })
        console.log(result)
        return result
    }

    private async addItems(chequeRequest: SoftChequeRequest, data: any): Promise<void> {
        const items: Item[] = []
        let summ: number = 0
        for (const [index, item] of chequeRequest.basket.entries()) {
            const price: number = await this.ecomService.getPrice(item.goodsId!, chequeRequest.storeId)
            summ += price * item.quantity!
            items.push({
                PositionNumber: {
                    _text: (index + 1).toString()
                },
                Article: {
                    _text: item.goodsId!.toString()
                },
                Quantity: {
                    _text: item.quantity!.toString()
                },
                Price: {
                    _text: price.toString()
                },
                Discount: {
                    _text: '0'
                },
                Summ: {
                    _text: (price * item.quantity!).toString()
                },
                SummDiscounted: {
                    _text: (price * item.quantity!).toString()
                }
            })
        }
        this.updateObjectValue<number>('Summ', summ, data)
        this.updateObjectValue<number>('SummDiscounted', summ, data)
        this.addObjectProperty<Item[]>('Item', items, data, 'ChequeRequest')
    }

    private addCoupons(chequeRequest: SoftChequeRequest, data: any): void {
        this.addObjectProperty<Coupons>(
            'Coupons',
            {
                Coupon: [
                    {
                        Number: {
                            _text: chequeRequest.coupons![0].number || ' '
                        }
                    }
                ]
            },
            data,
            'ChequeRequest'
        )
    }

    private async sendRequest(url: string, data: string, headers?: SoapHeaders): Promise<ChequeResponseModel> {
        const { response } = await this.soapRequest(url, data, headers)
        const { body, statusCode } = response
        logger.info(statusCode)
        logger.info(body)
        return converter.xml2js(body, { compact: true, alwaysChildren: true }) as ChequeResponseModel
    }

    private getXmlRequestDataFromFile(path: string): string {
        return fs.readFileSync(path, 'utf-8')
    }

    private async soapRequest(url: string, xml: string, headers?: SoapHeaders): Promise<any> {
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
