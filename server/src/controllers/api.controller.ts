import { Get, JsonController } from 'routing-controllers'

@JsonController()
export class ApiController {
    @Get()
    public apiInfo() {
        return {
            status: 'available',
            info: 'xcom api',
            version: '1.10.0',
            startAt: new Date()
        }
    }
}
