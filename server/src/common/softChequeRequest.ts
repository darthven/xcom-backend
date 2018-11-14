import { ArrayNotEmpty, IsDefined, IsInt, IsNotEmpty, ValidateIf } from 'class-validator'
import { ChequeRequest } from './chequeRequest'
import { Coupon } from './coupon'

export class SoftChequeRequest extends ChequeRequest {
    @IsDefined()
    @IsNotEmpty()
    public storeId: string = ''

    @IsDefined()
    @IsNotEmpty()
    public loyaltyCard: string = ''

    @IsDefined()
    public coupons?: Coupon[] = []
}
