import { IsDefined, IsOptional } from 'class-validator'
import { ChequeRequest } from './chequeRequest'
import { Coupon } from './coupon'

export class SoftChequeRequest extends ChequeRequest {
    @IsDefined()
    public storeId!: number

    @IsOptional()
    public loyaltyCard: string | undefined

    @IsOptional()
    public phoneNumber: string | undefined

    @IsOptional()
    public email: string | undefined

    public coupons?: Coupon[]
}
