import * as fs from 'fs'
import * as request from 'request-promise-native'
import { HttpError } from 'routing-controllers'
import { Inject, Service } from 'typedi'
import { isArray } from 'util'
import * as converter from 'xml-js'

import { InvalidCoupon } from '../common/invalidCoupon'
import { SoftChequeRequest } from '../common/softChequeRequest'
import logger from '../config/logger.config'
import { EcomService } from '../ecom/ecomService'
import { ManzanaCheque } from '../manzana/manzanaCheque'
import {
    CHEQUE_REQUEST,
    ChequeRequestModel,
    ChequeResponse,
    ChequeResponseModel,
    CouponDefinition,
    Coupons,
    Item
} from './soapDefinitions'

interface SoapHeaders {
    'user-agent'?: string
    'Content-Type'?: string
    soapAction?: string
}

@Service()
export default class SoapUtil {
    @Inject()
    private ecomService!: EcomService

    public async sendRequest(url: string, chequeRequest: SoftChequeRequest): Promise<ManzanaCheque | InvalidCoupon[]> {
        const requestData: ChequeRequestModel = await this.createSoftChequeRequest(chequeRequest)
        const xmlData: string = converter.js2xml(requestData, { compact: true })
        const response: ChequeResponseModel = await this.sendSoapRequest(url, xmlData, {
            'Content-Type': 'text/xml;charset=UTF-8'
        })
        const data: ChequeResponse =
            response['soap:Envelope']['soap:Body'].ProcessRequestResponse.ProcessRequestResult.ChequeResponse
        if (data.Message._text !== 'OK') {
            throw new HttpError(400, data.Message._text)
        }
        if (data.Coupons) {
            const coupons: Coupons = requestData['soap:Envelope']['soap:Body'].ProcessRequest.request.ChequeRequest
                .Coupons!
            const invalidCoupons = this.checkCoupons(data.Coupons, coupons)
            if (invalidCoupons.length > 0) {
                return invalidCoupons
            }
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
        return this.sendSoapRequest(url, this.getXmlRequestDataFromFile(pathToXml), headers)
    }

    public async createSoftChequeRequest(chequeRequest: SoftChequeRequest): Promise<ChequeRequestModel> {
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
            this.addCoupons(chequeRequest, data)
        }
        return data
    }

    private updateObjectValue<T>(property: string, value: T, object: any, index?: number): void {
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

    private addObjectProperty<T>(property: string, value: T, object: any, parentProperty: string): void {
        for (const key in object) {
            if (key === parentProperty) {
                object[key][property] = value
                break
            } else if (object[key] instanceof Object) {
                this.addObjectProperty(property, value, object[key], parentProperty)
            }
        }
    }

    private async addItems(chequeRequest: SoftChequeRequest, data: any): Promise<void> {
        const items: Item[] = []
        const prices: Array<{ goodsId: number; price: number }> = await this.ecomService.getPrices(
            chequeRequest.basket.map(it => it.goodsId!),
            chequeRequest.storeId
        )
        let summ: number = 0
        for (const [index, item] of chequeRequest.basket.entries()) {
            const price = prices.find(it => it.goodsId! === item.goodsId!)!.price
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
        const coupons: CouponDefinition[] = []
        for (const coupon of chequeRequest.coupons!) {
            if (coupon.number) {
                coupons.push({
                    Number: {
                        _text: coupon.number!
                    }
                })
            } else if (coupon.emissionId) {
                coupons.push({
                    EmissionId: {
                        _text: coupon.emissionId!
                    }
                })
            } else if (coupon.typeId) {
                coupons.push({
                    TypeId: {
                        _text: coupon.typeId!
                    }
                })
            }
        }
        this.addObjectProperty<Coupons>(
            'Coupons',
            {
                Coupon: coupons
            },
            data,
            'ChequeRequest'
        )
    }

    private checkCoupons(couponsFromResponse: Coupons, couponsFromRequest: Coupons): InvalidCoupon[] {
        const invalidCoupons = []
        for (const [index, coupon] of couponsFromResponse.Coupon.entries()) {
            if (coupon.ApplicabilityCode!._text === '0') {
                invalidCoupons.push({
                    message: coupon.ApplicabilityMessage!._text,
                    couponId: couponsFromRequest.Coupon[index].Number
                        ? couponsFromRequest.Coupon[index].Number!._text
                        : couponsFromRequest.Coupon[index].EmissionId
                            ? couponsFromRequest.Coupon[index].EmissionId!._text
                            : couponsFromRequest.Coupon[index].TypeId!._text
                })
            }
        }
        return invalidCoupons
    }

    private async sendSoapRequest(url: string, xml: string, headers?: SoapHeaders): Promise<ChequeResponseModel> {
        const response = await request({
            method: 'POST',
            url,
            headers,
            body: xml,
            json: false
        })
        logger.info(response)
        return converter.xml2js(response, { compact: true, alwaysChildren: true }) as ChequeResponseModel
    }

    private getXmlRequestDataFromFile(path: string): string {
        return fs.readFileSync(path, 'utf-8')
    }
}
