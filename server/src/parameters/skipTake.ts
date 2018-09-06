import { IsPositive } from 'class-validator'

export class SkipTake {
    @IsPositive()
    public skip?: number
    @IsPositive()
    public take?: number

    constructor(query: any) {
        if (query.skip) {
            this.skip = parseInt(query.skip, 10)
        }
        if (query.take) {
            this.take = parseInt(query.take, 10)
        }
    }
}
