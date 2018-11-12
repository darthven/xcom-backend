import { IsDefined, IsInt, IsNotEmpty } from 'class-validator'

export class Item {
    @IsDefined()
    @IsInt()
    public goodsId?: number
    @IsDefined()
    @IsInt()
    public quantity?: number
}
