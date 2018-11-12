import { IsDefined, IsInt, IsNotEmpty, ValidateIf } from 'class-validator'

// one of the fields identify a coupon
export class Coupon {
    @IsDefined()
    @IsNotEmpty()
    @ValidateIf(o => !o.emissionId && !o.typeId)
    public number?: string

    @IsDefined()
    @IsNotEmpty()
    @ValidateIf(o => !o.number && !o.typeId)
    public emissionId?: string

    @IsDefined()
    @IsNotEmpty()
    @ValidateIf(o => !o.number && !o.emissionId)
    public typeId?: string
}
