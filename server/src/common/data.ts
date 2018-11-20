import * as bcrypt from 'bcrypt'

import { Admin } from '../mongo/entity/admin'

export const ADMINS: Admin[] = [
    new Admin('admin', bcrypt.hashSync('admin', bcrypt.genSaltSync(10))),
    new Admin('test', bcrypt.hashSync('test', bcrypt.genSaltSync(10)))
]

export const TECHNICAL_CARD = '9419410000035'
