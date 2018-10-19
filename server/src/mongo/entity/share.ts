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
        this.id = parseInt(csvRowData.ID, 10)
        this.goodId = parseInt(csvRowData['Код А2005'], 10)
        this.discountValue = parseInt(csvRowData.Значение, 10)
        this.packCount = parseInt(csvRowData['Кол-во упаковок'], 10)
        this.attributeZOZ = !!parseInt(csvRowData['Признак ЗОЗ'], 10)
        this.startDate = moment(csvRowData['Дата начала'], 'DD.MM.YYYY').toDate()
        // this.endDate = moment(csvRowData['Дата окончания'], 'DD.MM.YYYY').toDate()
        this.endDate = new Date('11/11/2018')
        this.description = csvRowData['Описание акции на сайт']
        this.regions = csvRowData['Регионы для показа на сайте'].split(' ').map(value => parseInt(value, 10))
    }
}
