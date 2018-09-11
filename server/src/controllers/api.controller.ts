import { Get, JsonController } from 'routing-controllers'

@JsonController()
export class ApiController {
    @Get()
    public apiInfo() {
        return {
            status: 'available',
            info: 'xcom api',
            version: '1.1.0',
            startAt: new Date()
        }
    }
}
