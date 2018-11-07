import { IsDefined, IsNotEmpty } from 'class-validator'

export class ManzanaUser {
    @IsDefined()
    @IsNotEmpty()
    public Id?: string
    @IsDefined()
    public MobilePhone?: string
}
