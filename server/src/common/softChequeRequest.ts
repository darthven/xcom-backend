import { ArrayNotEmpty, IsDefined, IsInt, IsNotEmpty, IsString, NotEquals, ValidateIf } from 'class-validator'
import { ChequeRequest } from './chequeRequest'
import { Coupon } from './coupon'

export class SoftChequeRequest extends ChequeRequest {
    @IsDefined()
    public storeId!: number

    @IsNotEmpty()
    @IsString()
    public loyaltyCard!: string

    public coupons?: Coupon[]
}
