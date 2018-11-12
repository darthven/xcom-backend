import { IsArray, IsDefined, IsPositive, IsString, MinLength } from 'class-validator'

export class LocationFilter {
    @IsDefined()
    @IsPositive()
    public region?: number

    @IsString()
    @MinLength(1)
    public type?: string

    @IsArray()
    public stores?: number[]

    constructor(query: any) {
        if (query.region) {
            this.region = parseInt(query.region, 10)
        }
        if (query.type) {
            this.type = query.type
        }
        this.stores = query.store // can be array
    }
}
