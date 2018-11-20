import { IsDefined, IsNotEmpty, IsOptional } from 'class-validator'
import { ChequeRequest } from './chequeRequest'
import { Coupon } from './coupon'

export class SoftChequeRequest extends ChequeRequest {
    @IsDefined()
    @IsNotEmpty()
    public storeId: string = ''

    @IsOptional()
    public loyaltyCard: string | undefined

    @IsOptional()
    public phoneNumber: string | undefined

    @IsOptional()
    public email: string | undefined

    @IsDefined()
    public coupons?: Coupon[] = []
}
