import { Inject, Service } from 'typedi'

@Service()
export default class LocalizationManager {
    @Inject('locale')
    private localeDescriptor: any

    constructor(localeDescriptor: any) {
        this.localeDescriptor = localeDescriptor
    }

    public getValue(key: string) {
        return this.localeDescriptor[key]
    }
}
