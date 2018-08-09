import { Get, JsonController } from 'routing-controllers'

@JsonController()
export class AuthController {
    @Get()
    public apiInfo() {
        return {
            status: 'available',
            info: 'xcom api',
            version: '1.0.0',
            startAt: new Date()
        }
    }
}
