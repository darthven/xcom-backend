import { Max, Min } from 'class-validator'

export class SkipTake {
    @Min(0)
    public skip: number
    @Min(1)
    @Max(1000)
    public take: number

    constructor(query: any) {
        this.skip = query.skip ? parseInt(query.skip, 10) : 0
        this.take = query.take ? parseInt(query.take, 10) : 10
    }
}
