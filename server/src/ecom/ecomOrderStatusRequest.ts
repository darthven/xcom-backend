export interface EcomOrderStatusRequest {
    /**
     * Идентификатор статуса заказа
     */
    statusId: number

    /**
     * Текст комментария к изменению статуса заказа
     */
    comment?: string
}
