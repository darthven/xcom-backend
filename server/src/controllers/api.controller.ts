import { Get, JsonController } from 'routing-controllers'
import { NODE_ENV } from '../config/env.config'

@JsonController()
export class ApiController {
    @Get()
    public apiInfo() {
        return {
            status: 'available',
            info: 'xcom api',
            version: '1.10.0',
            startAt: new Date(),
            env: NODE_ENV
        }
    }
}
