"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
class Share {
    constructor(csvRowData) {
        this.id = parseInt(csvRowData.ID, 10);
        this.goodId = parseInt(csvRowData['Код А2005'], 10);
        this.discountValue = parseInt(csvRowData.Значение, 10);
        this.packCount = parseInt(csvRowData['Кол-во упаковок'], 10);
        this.attributeZOZ = !!parseInt(csvRowData['Признак ЗОЗ'], 10);
        this.startDate = moment(csvRowData['Дата начала'], 'DD.MM.YYYY').toDate();
        // this.endDate = moment(csvRowData['Дата окончания'], 'DD.MM.YYYY').toDate()
        this.endDate = new Date('11/11/2018');
        this.description = csvRowData['Описание акции на сайт'];
        this.regions = csvRowData['Регионы для показа на сайте'].split(' ').map(value => parseInt(value, 10));
    }
}
exports.Share = Share;
