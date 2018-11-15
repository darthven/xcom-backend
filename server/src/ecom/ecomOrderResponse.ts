export interface EcomOrderResponse {
    /**
     * Код источника заказа
     */
    serviceId: string

    /**
     * Код склада
     */
    storeId: number

    /**
     * Внутренний код заказа
     */
    orderId: number

    /**
     * Дата создания заказа в ecom
     */
    orderDate: string

    /**
     * Сумма заказа
     */
    orderAmount: number

    /**
     * Количество позиций заказа
     */
    goodsRowCount: number
}
