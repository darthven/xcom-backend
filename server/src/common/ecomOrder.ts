// https://docs.google.com/document/d/12qB6IpXknP48yfyHkfkvrCxZ-NvEKq-hMchIRLeuHdc/edit#heading=h.bn92tmk9unyx
import { ManzanaCheque } from '../manzana/manzanaCheque'
import { ChequeItem } from './chequeItem'
import { FiscalChequeRequest } from './fiscalChequeRequest'

export interface EcomOrderMeta {
    storeId: string // Код склада
    loyaltyCard?: string // Код карты клиента
    clientName: string // ФИО Клиента
    clientTel: string // Номер телефона клиента (7XXXXXXXXXX)
}

export interface EcomOrder extends EcomOrderMeta {
    serviceDetail?: string // Детали источника заказа (переход с яндекс маркета и т.п.)
    preorder?: boolean // Признак предзаказа (Заказ того, чего нет на остатках в данный момент)
    extId: string // Код заказа источника
    extDate: string // Дата заказа источника
    extStatusId?: string // Внешний статус источника (если есть)
    extComment?: string // Комментарий от внешней системы
    insuranceId?: string // Идентификатор сервиса страхования по заказу. (Заказы по страховому контракту)
    clientEmail?: string // Электронная почта клиента
    clientAddress?: string // Адрес доставки
    clientComment?: string // Комментарий от клиента
    loyaltyCardType?: string // Тип карты лояльности (“Забота о здоровье” и т.п.)
    payGUID?: string // Идентификатор транзакции платежной системы
    payType?: number // Тип оплаты
    paySum?: string // Сумма оплаты
    deliveryServiceId?: string // Сервис доставки
    deliveryTimeFrom?: string // Дата доставки с * (Если в заказе указать сервис доставки, то все поля “delivery*” становятся обязательными)
    deliveryTimeTo?: string // Дата доставки по * (Если в заказе указать сервис доставки, то все поля “delivery*” становятся обязательными)
    additionalFields?: {} // Список дополнительных полей
    basket: ChequeItem[] // Корзина товара (массив элементов)
}

export interface SbolAuthorizedEcomOrder extends EcomOrder {
    payType: number
    payGUID: string
}

export const createPickupOrderRequest = (
    { storeId, loyaltyCard, clientName, clientTel }: FiscalChequeRequest,
    manzanaCheque: ManzanaCheque
): EcomOrder => {
    return {
        storeId,
        loyaltyCard,
        clientName,
        clientTel,
        extId: '123', // TODO generate id
        extDate: new Date().toDateString(),
        basket: manzanaCheque.basket
    }
}

export const createSbolAuthorizedOrderRequest = (
    { storeId, loyaltyCard, clientName, clientTel }: FiscalChequeRequest,
    manzanaCheque: ManzanaCheque,
    payGUID: string
): SbolAuthorizedEcomOrder => {
    return {
        storeId,
        loyaltyCard,
        clientName,
        clientTel,
        payGUID,
        payType: 1, // Оплата онлайн
        extId: '123', // TODO generate id
        extDate: new Date().toDateString(),
        basket: manzanaCheque.basket
    }
}
