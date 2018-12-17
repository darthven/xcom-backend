import { Inject } from 'typedi'
import LocalizationManager from '../utils/localizationManager'

export class GeneralController {
    @Inject()
    protected readonly localizationManager!: LocalizationManager
}
