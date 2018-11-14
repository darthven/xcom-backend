import { ArrayNotEmpty, IsDefined, IsInt, IsNotEmpty, ValidateIf } from 'class-validator'
import { Coupon } from './coupon'
import { Item } from './item'

export class ChequeRequest {
    @IsDefined()
    @ArrayNotEmpty()
    public basket!: Item[]
}
