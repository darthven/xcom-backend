import * as bcrypt from 'bcrypt'

import { Admin } from '../mongo/entity/admin'

const ADMINS: Admin[] = [
    new Admin('admin', bcrypt.hashSync('admin', bcrypt.genSaltSync(10))),
    new Admin('test', bcrypt.hashSync('test', bcrypt.genSaltSync(10)))
]

export { ADMINS }
