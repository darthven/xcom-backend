import * as moment from 'moment'

import { CSVData } from '../../common/definitions'

export class Share {
    public id: number
    public goodId: number // 'Код А2005'
    public discountValue: number
    public packCount: number
    public attributeZOZ: boolean
    public startDate: Date
    public endDate: Date
    public description: string
    public regions: number[]

    constructor(csvRowData: CSVData) {
        this.id = parseInt(csvRowData['ID акции'], 10)
        this.goodId = parseInt(csvRowData.КодА2005, 10)
        this.discountValue = parseInt(csvRowData['Значение скидки'], 10)
        this.packCount = parseInt(csvRowData['Кол-во упаковок'], 10)
        this.attributeZOZ = !!parseInt(csvRowData['Признак ЗОЗ'], 10)
        this.startDate = moment(csvRowData['Дата начала'], 'DD.MM.YYYY').toDate()
        this.endDate = moment(csvRowData['Дата окончания'], 'DD.MM.YYYY').toDate()
        this.description = csvRowData['Описание акции']
        this.regions = csvRowData.Регион.split(' ').map(value => parseInt(value, 10))
    }
}
