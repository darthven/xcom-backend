import { ArrayNotEmpty, IsDefined, IsInt, IsNotEmpty, ValidateIf } from 'class-validator'
import { EcomOrderMeta } from '../ecom/ecomOrder'
import { ChequeRequest } from './chequeRequest'
import { Coupon } from './coupon'
import { SoftChequeRequest } from './softChequeRequest'

export class FiscalChequeRequest extends SoftChequeRequest implements EcomOrderMeta {
    @IsDefined()
    @IsNotEmpty()
    public clientName!: string

    @IsDefined()
    @IsNotEmpty()
    public clientTel!: string

    @ValidateIf(o => o.loyaltyCard)
    @IsNotEmpty()
    public loyaltyCardType!: string
}
