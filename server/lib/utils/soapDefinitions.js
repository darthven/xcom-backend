"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CHEQUE_REQUEST = {
    'soap:Envelope': {
        _attributes: {
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
            'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/'
        },
        'soap:Body': {
            ProcessRequest: {
                _attributes: {
                    xmlns: 'http://loyalty.manzanagroup.ru/loyalty.xsd'
                },
                request: {
                    ChequeRequest: {
                        _attributes: {
                            ChequeType: 'Soft'
                        },
                        RequestID: {
                            _text: '1001'
                        },
                        DateTime: {
                            _text: '2032-01-18T01:43:56+03:00'
                        },
                        Organization: {
                            _text: '0001'
                        },
                        BusinessUnit: {
                            _text: '001'
                        },
                        POS: {
                            _text: '001'
                        },
                        Card: {
                            CardNumber: {
                                _text: '9419410000516'
                            }
                        },
                        Number: {
                            _text: 'Anse-1'
                        },
                        OperationType: {
                            _text: 'Sale'
                        },
                        Summ: {
                            _text: '10000'
                        },
                        Discount: {
                            _text: '0'
                        },
                        SummDiscounted: {
                            _text: '10000'
                        },
                        PaidByBonus: {
                            _text: '0'
                        }
                    }
                },
                orgName: {
                    _text: 'Ozerki'
                }
            }
        }
    }
};
exports.CHEQUE_REQUEST = CHEQUE_REQUEST;
