import * as auth from 'basic-auth'
import * as bcrypt from 'bcrypt'
import 'reflect-metadata'
import { Action } from 'routing-controllers'
import { Container } from 'typedi'

import { Admin } from '../mongo/entity/admin'
import { AdminsRepository } from '../mongo/repository/admins'

export const authorizationChecker = async (action: Action, roles: string[]): Promise<boolean> => {
    const request: any = action.request
    const user: auth.BasicAuthResult | undefined = auth(request)
    if (user) {
        const admin: Admin | undefined = await Container.get(AdminsRepository).collection.findOne({
            username: user.name
        })
        if (admin && bcrypt.compareSync(user.pass, admin.password)) {
            return true
        }
    }
    return false
}
