import { IsDefined, IsInt, IsOptional, IsString } from 'class-validator'

export class Item {
    @IsDefined()
    @IsInt()
    public goodsId!: number
    @IsDefined()
    @IsInt()
    public quantity!: number
    @IsOptional()
    @IsString()
    public batchId?: string
}
