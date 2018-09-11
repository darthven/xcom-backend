import { Max, Min } from 'class-validator'

export class SkipTake {
    @Min(0)
    @Max(1000)
    public skip?: number
    @Min(1)
    @Max(1000)
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
