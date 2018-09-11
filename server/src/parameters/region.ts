import { IsPositive } from 'class-validator'

export class Region {
    @IsPositive()
    public region: number

    constructor(query: any) {
        this.region = parseInt(query.region, 10)
    }
}
