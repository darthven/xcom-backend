import { IsPositive, IsString, MinLength } from 'class-validator'

export class LocationFilter {
    @IsPositive()
    public region: number

    @IsString()
    @MinLength(1)
    public type?: string

    constructor(query: any) {
        this.region = parseInt(query.region, 10)
        if (query.type) {
            this.type = query.type
        }
    }
}
