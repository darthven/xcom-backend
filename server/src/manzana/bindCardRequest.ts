export class BindCardRequest {
    public Id: string
    public CardNumber: string
    public SessionId: string

    constructor(CardNumber: string, Id: string, SessionId: string) {
        this.Id = Id
        this.CardNumber = CardNumber
        this.SessionId = SessionId
    }
}
