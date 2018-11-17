import { IsDefined, IsMongoId } from 'class-validator'

export class SbolCallback {
    @IsDefined()
    @IsMongoId()
    public orderNumber!: string

    public orderId?: string
}
