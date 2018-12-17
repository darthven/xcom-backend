import { Inject, Service } from 'typedi'

@Service()
export default class LocalizationManager {
    @Inject('locale')
    private localeDescriptor: any

    constructor(localeDescriptor: any) {
        this.localeDescriptor = localeDescriptor
    }

    public getValue(key: string, ...args: any[]) {
        let result: string = this.localeDescriptor[key]
        if (args) {
            args.forEach((item, index) => {
                result = this.localeDescriptor[key].replace(`{value${index}}`, item)
            })
        }
        return result
    }
}
