export class BindCardRequest {
    public Id: string
    public CardNumber: string
    public SessionId: string
    public readonly PartnerId = '5C0F2C5E-69A6-E611-80D2-00155DFA8043'

    constructor(CardNumber: string, Id: string, SessionId: string) {
        this.Id = Id
        this.CardNumber = CardNumber
        this.SessionId = SessionId
    }
}
