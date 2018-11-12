import { ECOM_PASS, ECOM_USER } from '../config/env.config'

export const ecomOptions = {
    method: 'GET',
    auth: {
        user: ECOM_USER,
        pass: ECOM_PASS
    },
    json: true
}
