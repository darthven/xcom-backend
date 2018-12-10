export interface RefundRequest {
    /**
     *  Номер заказа в платёжном шлюзе. Уникален в пределах шлюза.
     */
    orderId: string

    /**
     * Сумма платежа в копейках (или центах)
     */
    amount: number // цена в копейках
}
