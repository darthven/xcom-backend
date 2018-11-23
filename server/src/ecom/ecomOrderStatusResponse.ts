export interface EcomOrderStatusResponse {
    /**
     * Код источника заказа
     */
    serviceId: string

    /**
     * Код ошибки
     */
    errorCode: number

    /**
     * Текст ошибки
     */
    message: string
}
