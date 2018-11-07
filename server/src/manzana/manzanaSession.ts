import { IsDefined, IsNotEmpty } from 'class-validator'

export class ManzanaSession {
    @IsDefined()
    @IsNotEmpty()
    public sessionid: string
    @IsDefined()
    @IsNotEmpty()
    public id: string

    constructor(sessionid: string, id: string) {
        this.sessionid = sessionid
        this.id = id
    }
}
