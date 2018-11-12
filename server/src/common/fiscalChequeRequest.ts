import { ArrayNotEmpty, IsDefined, IsInt, IsNotEmpty, ValidateIf } from 'class-validator'
import { ChequeRequest } from './chequeRequest'
import { Coupon } from './coupon'
import { EcomOrderMeta } from './ecomOrder'
import { SoftChequeRequest } from './softChequeRequest'

export class FiscalChequeRequest extends SoftChequeRequest implements EcomOrderMeta {
    @IsDefined()
    @ArrayNotEmpty()
    public clientName: string = ''

    @IsDefined()
    @ArrayNotEmpty()
    public clientTel: string = ''

    @IsDefined()
    @IsInt()
    public payType: number = 0
}
