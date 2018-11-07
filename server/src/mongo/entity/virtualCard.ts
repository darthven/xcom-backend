export class VirtualCard {
    public cardNumber: string
    public used: boolean

    constructor(cardNumber: string, used: boolean) {
        this.cardNumber = cardNumber
        this.used = used
    }
}
