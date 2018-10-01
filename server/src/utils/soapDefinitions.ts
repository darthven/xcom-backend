interface ElementValue {
    _text: string
}

interface Item {
    PositionNumber: ElementValue
    Article: ElementValue
    Price: ElementValue
    Quantity: ElementValue
    Summ: ElementValue
    Discount: ElementValue
    SummDiscounted: ElementValue
}

interface ChequeRequestModel {
    'soap:Envelope': {
        _attributes: {
            'xmlns:xsi': string
            'xmlns:xsd': string
            'xmlns:soap': string
        }
        'soap:Body': {
            ProcessRequest: {
                _attributes: {
                    xmlns: string
                }
                request: {
                    ChequeRequest: {
                        _attributes: {
                            ChequeType: string
                        }
                        RequestID: ElementValue
                        DateTime: ElementValue
                        Organization: ElementValue
                        BusinessUnit: ElementValue
                        POS: ElementValue
                        Card: {
                            CardNumber: ElementValue
                        }
                        Number: ElementValue
                        OperationType: ElementValue
                        Summ: ElementValue
                        Discount: ElementValue
                        SummDiscounted: ElementValue
                        PaidByBonus: ElementValue
                        Items: {
                            Item: Item[]
                        }
                    }
                }
                orgName: ElementValue
            }
        }
    }
}

interface ChequeResponseModel {
    _declaration: {
        _attributes: {
            version: string
            encoding: string
        }
    }
    'soap:Envelope': {
        _attributes: {
            'xmlns:soap': string
            'xmlns:xsi': string
            'xmlns:xsd': string
        }
        'soap:Body': {
            ProcessRequestResponse: {
                _attributes: {
                    xmlns: string
                }
                ProcessRequestResult: {
                    ChequeResponse: {
                        TransactionID: ElementValue
                        RequestID: ElementValue
                        Processed: ElementValue
                        ReturnCode: ElementValue
                        Message: ElementValue
                        CardBalance: ElementValue
                        CardNormalBalance: ElementValue
                        CardStatusBalance: ElementValue
                        CardActiveBalance: ElementValue
                        CardNormalActiveBalance: ElementValue
                        CardStatusActiveBalance: ElementValue
                        CardSumm: ElementValue
                        CardDiscount: ElementValue
                        CardChargedMoney: ElementValue
                        CardWriteoffMoney: ElementValue
                        CardMoneyBalance: ElementValue
                        Summ: ElementValue
                        Discount: ElementValue
                        SummDiscounted: ElementValue
                        ChargedBonus: ElementValue
                        ActiveChargedBonus: ElementValue
                        ChargedStatusBonus: ElementValue
                        ActiveChargedStatusBonus: ElementValue
                        AvailablePayment: ElementValue
                        WriteoffBonus: ElementValue
                        Item: {
                            Item: Item[]
                        }
                    }
                }
            }
        }
    }
}

const CHEQUE_REQUEST: ChequeRequestModel = {
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
                        },
                        Items: {
                            Item: [
                                {
                                    PositionNumber: {
                                        _text: '1'
                                    },
                                    Article: {
                                        _text: 'AE'
                                    },
                                    Price: {
                                        _text: '20'
                                    },
                                    Quantity: {
                                        _text: '200'
                                    },
                                    Summ: {
                                        _text: '4000'
                                    },
                                    Discount: {
                                        _text: '0'
                                    },
                                    SummDiscounted: {
                                        _text: '4000'
                                    }
                                },
                                {
                                    PositionNumber: {
                                        _text: '2'
                                    },
                                    Article: {
                                        _text: 'SHIO'
                                    },
                                    Price: {
                                        _text: '30'
                                    },
                                    Quantity: {
                                        _text: '200'
                                    },
                                    Summ: {
                                        _text: '6000'
                                    },
                                    Discount: {
                                        _text: '0'
                                    },
                                    SummDiscounted: {
                                        _text: '6000'
                                    }
                                }
                            ]
                        }
                    }
                },
                orgName: {
                    _text: 'Ozerki'
                }
            }
        }
    }
}

export { ChequeRequestModel, ChequeResponseModel, CHEQUE_REQUEST }
