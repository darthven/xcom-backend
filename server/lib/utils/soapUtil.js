"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const fs = require("fs");
const typedi_1 = require("typedi");
const converter = require("xml-js");
const logger_config_1 = require("../config/logger.config");
const soapDefinitions_1 = require("./soapDefinitions");
let SoapUtil = class SoapUtil {
    async sendRequestFromXml(url, xml, headers) {
        return this.sendRequest(url, xml, headers);
    }
    async sendRequestFromFile(url, pathToXml, headers) {
        return this.sendRequest(url, this.getXmlRequestDataFromFile(pathToXml), headers);
    }
    updateObjectValue(property, value, object, index) {
        for (const key in object) {
            if (key === property) {
                object[key] = value;
                break;
            }
            else if (index && object[key] instanceof Array) {
                object[key][index][property] = value;
                break;
            }
            else if (object[key] instanceof Object) {
                this.updateObjectValue(property, value, object[key], index);
            }
        }
    }
    addObjectProperty(property, value, object, parentProperty) {
        for (const key in object) {
            if (key === parentProperty) {
                object[key][property] = value;
                break;
            }
            else if (object[key] instanceof Object) {
                this.addObjectProperty(property, value, object[key], parentProperty);
            }
        }
    }
    createChequeRequest(chequeRequest, type) {
        const data = Object.assign({}, soapDefinitions_1.CHEQUE_REQUEST);
        // console.log(JSON.stringify(data, null, 4))
        this.updateObjectValue('RequestID', Math.round(Math.random() * (1100 - 1000) + 1000), data);
        this.updateObjectValue('ChequeType', type, data);
        this.updateObjectValue('CardNumber', chequeRequest.cardNumber, data);
        this.updateObjectValue('DateTime', new Date().toISOString(), data);
        this.updateObjectValue('OperationType', 'Sale', data);
        this.updateObjectValue('Summ', chequeRequest.summ, data);
        this.updateObjectValue('Discount', 0, data);
        this.updateObjectValue('SummDiscounted', chequeRequest.summ, data);
        this.updateObjectValue('PaidByBonus', chequeRequest.paidByBonus || 0, data);
        this.addItems(chequeRequest, data);
        if (chequeRequest.coupons) {
            this.addCoupons(chequeRequest, data);
        }
        // console.log('REQUEST', converter.js2xml(data, { compact: true }))
        return converter.js2xml(data, { compact: true });
    }
    addItems(chequeRequest, data) {
        const items = [];
        for (const item of chequeRequest.items) {
            items.push({
                PositionNumber: {
                    _text: item.id.toString()
                },
                Article: {
                    _text: item.article
                },
                Quantity: {
                    _text: item.count.toString()
                },
                Price: {
                    _text: item.price.toString()
                },
                Discount: {
                    _text: '0'
                },
                Summ: {
                    _text: item.summ.toString()
                },
                SummDiscounted: {
                    _text: item.summ.toString()
                }
            });
        }
        this.addObjectProperty('Items', {
            Item: items
        }, data, 'ChequeRequest');
    }
    addCoupons(chequeRequest, data) {
        this.addObjectProperty('Coupons', {
            Coupon: [
                {
                    Number: {
                        _text: chequeRequest.coupons[0].number
                    }
                },
                {
                    EmissionId: {
                        _text: chequeRequest.coupons[1].emissionId
                    }
                },
                {
                    TypeId: {
                        _text: chequeRequest.coupons[2].typeId
                    }
                }
            ]
        }, data, 'ChequeRequest');
    }
    async sendRequest(url, data, headers) {
        const { response } = await this.soapRequest(url, data, headers);
        const { body, statusCode } = response;
        logger_config_1.default.info(statusCode);
        logger_config_1.default.info(body);
        return converter.xml2js(body, { compact: true, alwaysChildren: true });
    }
    getXmlRequestDataFromFile(path) {
        return fs.readFileSync(path, 'utf-8');
    }
    async soapRequest(url, xml, headers) {
        return new Promise((resolve, reject) => {
            axios_1.default({
                method: 'post',
                url,
                headers,
                data: xml
            })
                .then(response => {
                resolve({
                    response: {
                        body: response.data,
                        statusCode: response.status
                    }
                });
            })
                .catch(error => {
                reject(error.response.data);
            });
        });
    }
};
SoapUtil = __decorate([
    typedi_1.Service()
], SoapUtil);
exports.default = SoapUtil;
// const obj = {
//     a: {
//         b: 'dssd',
//         c: {
//             items: [
//                 {
//                     q: 100
//                 },
//                 {
//                     q: 101
//                 },
//                 {
//                     q: 102
//                 }
//             ]
//         }
//     }
// }
// SoapUtil.updateObjectValue<number>('q', 324, obj, 1)
// SoapUtil.addObjectProperty('inner', { _text: 'test' }, obj, 'c')
// console.log(JSON.stringify(obj, null, 4))
// SoapUtil.sendRequestFromFile(MANZANA_CASH_URL, './request.xml', {
//     'Content-Type': 'text/xml'
// }).catch(err => logger.error(err))
