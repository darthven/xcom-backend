import * as bcrypt from 'bcrypt'

import { Admin } from '../mongo/entity/admin'

export const ADMINS: Admin[] = [
    new Admin('admin', bcrypt.hashSync('admin', bcrypt.genSaltSync(10))),
    new Admin('test', bcrypt.hashSync('test', bcrypt.genSaltSync(10)))
]

export const orderedCategoriesRoots: Array<{ id: number; order: number }> = [
    {
        id: 7,
        order: 0
    },
    {
        id: 6,
        order: 1
    },
    {
        id: 9,
        order: 2
    },
    {
        id: 3,
        order: 3
    },
    {
        id: 8,
        order: 4
    },
    {
        id: 2,
        order: 5
    },
    {
        id: 5,
        order: 6
    },
    {
        id: 14,
        order: 7
    },
    {
        id: 10,
        order: 8
    },
    {
        id: 13,
        order: 9
    }
]

export const TECHNICAL_CARD = '9419410000035'
