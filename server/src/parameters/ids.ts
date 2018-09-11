import { IsArray, IsEnum, IsPositive, Length } from 'class-validator'

export class Ids {
    @IsArray()
    @IsPositive({ each: true })
    public value!: number[]

    constructor(query: any) {
        if (query.ids) {
            this.value = query.ids
                .split(',')
                .map(Number)
                .filter(Number)
        }
    }
}
