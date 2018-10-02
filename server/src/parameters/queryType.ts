import { IsEnum } from 'class-validator'

export class QueryType {
    @IsEnum({ top: 'all', price: 'data', name: 'info' })
    public type?: string

    constructor(query: any) {
        this.type = query.querytype
    }
}
