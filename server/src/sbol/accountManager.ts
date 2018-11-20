import { Credentials } from './credentials'

export abstract class AccountManager {
    public abstract getForInn(inn: string): Credentials | undefined
}

export class ProdAccountManager extends AccountManager {
    private accounts: { [key: string]: Credentials } = {
        '5402036790': {
            userName: '6030000-api',
            password: 'OzeApt!666'
        },
        '5258139119': {
            userName: '60300001-api',
            password: 'OzeApt!666'
        },
        '4703148953': {
            userName: '60300003-api',
            password: 'OzeApt!666'
        },
        '7713059634': {
            userName: '60300004-api',
            password: 'OzeApt!666'
        },
        '7802611649': {
            userName: '6030000_ru-api',
            password: 'OzeApt!666'
        }
    }

    public getForInn(inn: string): Credentials {
        return this.accounts[inn]
    }
}

export class DevAccountManager implements AccountManager {
    public getForInn(inn: string): Credentials {
        return {
            userName: '6030000-api',
            password: '6030000'
        }
    }
}
