import * as fs from 'fs'
import { HttpError } from 'routing-controllers'
import { Inject, Service } from 'typedi'
import { isArray } from 'util'
import * as converter from 'xml-js'
// tslint:disable-next-line:no-var-requires
const ntlmRequest = require('httpntlm')

import { TECHNICAL_CARD } from '../common/data'
import { CardNotFound, CouponError } from '../common/errors'
import { InvalidCoupon } from '../common/invalidCoupon'
import { SoftChequeRequest } from '../common/softChequeRequest'
import { MANZANA_CASH_DOMAIN, MANZANA_CASH_PASSWORD, MANZANA_CASH_USERNAME } from '../config/env.config'
import logger from '../config/logger.config'
import { ManzanaCheque } from '../manzana/manzanaCheque'
import { Stock } from '../mongo/entity/stock'
import { StocksRepository } from '../mongo/repository/stocks'
import {
    Card,
    CardRequestModel,
    CardResponseModel,
    CardSoapRequest,
    ChequeRequestModel,
    ChequeResponse,
    ChequeResponseModel,
    ChequeSoapRequest,
    CouponDefinition,
    Coupons,
    Item,
    ManzanaItem
} from './soapDefinitions'

interface SoapHeaders {
    'user-agent'?: string
    'Content-Type'?: string
    soapAction?: string
}

interface PriceDescriptor {
    goodsId: number
    price: number
}

@Service()
export default class SoapUtil {
    @Inject()
    private stocksRepository!: StocksRepository

    public async sendRequest(url: string, chequeRequest: SoftChequeRequest): Promise<ManzanaCheque> {
        const handledRequest = await this.handleCard(url, chequeRequest)
        const requestData: ChequeRequestModel = await this.createSoftChequeRequest(handledRequest)
        const xmlData: string = converter.js2xml(requestData, { compact: true })
        const response: ChequeResponseModel = await this.sendSoapRequest(url, xmlData, {
            'Content-Type': 'text/xml;charset=UTF-8'
        })
        const data: ChequeResponse =
            response['soap:Envelope']['soap:Body'].ProcessRequestResponse.ProcessRequestResult.ChequeResponse
        if (data.Message._text === 'Карта не найдена') {
            throw new CardNotFound(parseInt(data.ReturnCode._text, 10), data.Message._text, handledRequest.loyaltyCard!)
        }
        if (data.Coupons) {
            const coupons: Coupons = requestData['soap:Envelope']['soap:Body'].ProcessRequest.request.ChequeRequest
                .Coupons!
            const invalidCoupons = this.checkCoupons(data.Coupons, coupons)
            if (invalidCoupons.length > 0) {
                throw new CouponError(parseInt(data.ReturnCode._text, 10), invalidCoupons)
            }
        }
        const items: ManzanaItem[] = Array.isArray(data.Item) ? data.Item : [data.Item]
        return {
            chargedBonus: data.ChargedBonus ? parseFloat(data.ChargedBonus._text) : 0,
            chargedStatusBonus: data.ChargedStatusBonus ? parseFloat(data.ChargedStatusBonus._text) : 0,
            writeOffBonus: data.WriteoffBonus ? parseFloat(data.WriteoffBonus._text) : 0,
            writeOffStatusBonus: data.ChargedStatusBonus ? parseFloat(data.ChargedStatusBonus._text) : 0,
            activeChargedBonus: data.ActiveChargedBonus ? parseFloat(data.ActiveChargedBonus._text) : 0,
            activeChargedStatusBonus: data.ActiveChargedStatusBonus
                ? parseFloat(data.ActiveChargedStatusBonus._text)
                : 0,
            amount: data.Summ ? parseFloat(data.Summ._text) : 0,
            amountDiscounted: data.SummDiscounted ? parseFloat(data.SummDiscounted._text) : 0,
            discount: data.Discount ? parseFloat(data.Discount._text) : 0,
            basket: items.map((item, index) => {
                return {
                    goodsId: parseInt(item.Article._text, 10),
                    batchId: chequeRequest.basket[index].batchId,
                    quantity: parseInt(item.Quantity._text, 10),
                    price: parseFloat(item.Price._text),
                    amount: parseFloat(item.SummDiscounted._text),
                    discount: parseFloat(item.Discount._text),
                    availablePayment: parseFloat(item.AvailablePayment._text),
                    chargedBonus: item.ChargedBonus ? parseFloat(item.AvailablePayment._text) : 0.0,
                    chargedStatusBonus: parseFloat(item.ChargedStatusBonus._text),
                    writeoffBonus: parseFloat(item.WriteoffBonus._text),
                    writeoffStatusBonus: parseFloat(item.WriteoffStatusBonus._text),
                    activeChargedBonus: parseFloat(item.ActiveChargedBonus._text),
                    activeChargedStatusBonus: parseFloat(item.ActiveChargedStatusBonus._text),
                    extendedAttribute: item.ExtendedAttribute
                        ? {
                              key: item.ExtendedAttribute.Key._text,
                              value: item.ExtendedAttribute.Value._text
                          }
                        : undefined
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

    public async createSoftChequeRequest(chequeRequest: SoftChequeRequest): Promise<ChequeSoapRequest> {
        const data = new ChequeSoapRequest()
        this.updateObjectValue<number>('RequestID', Math.round(Math.random() * (1100 - 1000) + 1000), data)
        this.updateObjectValue<string>('ChequeType', 'Soft', data)
        this.updateObjectValue<string>('CardNumber', chequeRequest.loyaltyCard!, data)
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

    private async handleCard(url: string, chequeRequest: SoftChequeRequest): Promise<SoftChequeRequest> {
        if (!chequeRequest.loyaltyCard) {
            const cardRequest: CardRequestModel | null = await this.createCardRequest(chequeRequest)
            if (cardRequest) {
                const cardResponse: CardResponseModel = await this.sendSoapRequest(
                    url,
                    converter.js2xml(cardRequest, { compact: true }),
                    {
                        'Content-Type': 'text/xml;charset=UTF-8'
                    }
                )
                const cards: Card[] | null =
                    cardResponse['soap:Envelope']['soap:Body'].ProcessRequestResponse.ProcessRequestResult.CardResponse
                        .Card
                if (cards && cards.length > 0) {
                    return {
                        ...chequeRequest,
                        loyaltyCard: cards[cards.length - 1].CardNumber._text
                    }
                }
            }
            return {
                ...chequeRequest,
                loyaltyCard: TECHNICAL_CARD
            }
        }
        return chequeRequest
    }

    private async createCardRequest(chequeRequest: SoftChequeRequest): Promise<CardSoapRequest | null> {
        const data = new CardSoapRequest()
        this.updateObjectValue<number>('RequestID', Math.round(Math.random() * (1100 - 1000) + 1000), data)
        this.updateObjectValue<string>('DateTime', new Date().toISOString(), data)
        if (chequeRequest.phoneNumber) {
            this.addObjectProperty('Phone', chequeRequest.phoneNumber, data, 'CardRequest')
        } else if (chequeRequest.email) {
            this.addObjectProperty('Email', chequeRequest.email, data, 'CardRequest')
        } else {
            return null
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
        const prices: PriceDescriptor[] = []
        const invalidGoodsIds: number[] = []
        for (const [index, item] of chequeRequest.basket.entries()) {
            const stock: Stock = await this.stocksRepository.collection.findOne({
                storeId: chequeRequest.storeId,
                goodsId: item.goodsId,
                batch: item.batchId || { $exists: true }
            })
            if (!stock) {
                invalidGoodsIds.push(item.goodsId)
            } else {
                prices.push({ goodsId: stock.goodsId, price: stock.storePrice })
            }
        }
        if (invalidGoodsIds.length > 0) {
            throw new HttpError(402, `Prices cannot be counted for the next goods: ${invalidGoodsIds.toString()}`)
        }
        let summ: number = 0
        for (const [index, item] of chequeRequest.basket.entries()) {
            const priceDescriptor: PriceDescriptor | undefined = prices.find(it => it.goodsId! === item.goodsId!)
            const itemTotalPrice: number = priceDescriptor!.price * item.quantity!
            summ += itemTotalPrice
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
                    _text: priceDescriptor!.price.toString()
                },
                Discount: {
                    _text: '0'
                },
                Summ: {
                    _text: itemTotalPrice.toString()
                },
                SummDiscounted: {
                    _text: itemTotalPrice.toString()
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
        let coupons: CouponDefinition | CouponDefinition[] = couponsFromResponse.Coupon
        if (!isArray(coupons)) {
            coupons = [coupons]
        }
        for (const [index, coupon] of coupons.entries()) {
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

    private async sendSoapRequest(url: string, xml: string, headers?: SoapHeaders): Promise<any> {
        logger.debug(`manzana request ${xml}`)
        return new Promise((resolve, reject) => {
            ntlmRequest.post(
                {
                    url,
                    headers,
                    username: MANZANA_CASH_USERNAME,
                    password: MANZANA_CASH_PASSWORD,
                    domain: MANZANA_CASH_DOMAIN,
                    body: xml
                },
                (err: Error, response: any) => {
                    if (err) {
                        reject(err)
                    } else {
                        logger.debug(`manzana response ${response.body}`)
                        resolve(
                            converter.xml2js(response.body, {
                                compact: true,
                                alwaysChildren: true
                            })
                        )
                    }
                }
            )
        })
    }

    private getXmlRequestDataFromFile(path: string): string {
        return fs.readFileSync(path, 'utf-8')
    }
}
