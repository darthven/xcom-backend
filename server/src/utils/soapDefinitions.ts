export interface ElementValue {
    _text: string
}

export interface ExtendedAttribute {
    Key: ElementValue
    Value: ElementValue
}

export interface Item {
    PositionNumber: ElementValue
    Article: ElementValue
    Price: ElementValue
    Quantity: ElementValue
    Summ: ElementValue
    Discount: ElementValue
    SummDiscounted: ElementValue
}

export interface ManzanaItem extends Item {
    AvailablePayment: ElementValue
    ChargedBonus: ElementValue
    ChargedStatusBonus: ElementValue
    ActiveChargedBonus: ElementValue
    ActiveChargedStatusBonus: ElementValue
    WriteoffBonus: ElementValue
    WriteoffStatusBonus: ElementValue
    ExtendedAttribute?: ExtendedAttribute
}

export interface CouponDefinition {
    Number?: ElementValue
    EmissionId?: ElementValue
    TypeId?: ElementValue
    ApplicabilityMessage?: ElementValue
    ApplicabilityCode?: ElementValue
}

export interface Card {
    CardNumber: ElementValue
    BonusType: ElementValue
    Discount: ElementValue
    Status: ElementValue
    CollaborationType: ElementValue
    CardTypeId: ElementValue
}

export interface Coupons {
    Coupon: CouponDefinition[]
}

export interface CardRequest {
    RequestID: ElementValue
    DateTime: ElementValue
    Organization: ElementValue
    BusinessUnit: ElementValue
    POS: ElementValue
    Phone?: ElementValue
    Email?: ElementValue
}

export interface CardResponse {
    TransactionID: ElementValue
    RequestID: ElementValue
    Processed: ElementValue
    ReturnCode: ElementValue
    Message: ElementValue
    FirstName: ElementValue
    LastName: ElementValue
    MiddleName: ElementValue
    BirthDate: ElementValue
    Age: ElementValue
    Phone: ElementValue
    Email: ElementValue
    Card: Card[]
}

export interface ChequeRequest {
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
    Item?: Item[]
    Coupons?: Coupons
}

export interface ChequeResponse {
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
    AvailablePayment: ElementValue
    ChargedBonus: ElementValue
    ChargedStatusBonus: ElementValue
    ActiveChargedBonus: ElementValue
    ActiveChargedStatusBonus: ElementValue
    WriteoffBonus: ElementValue
    WriteoffStatusBonus: ElementValue
    Item: ManzanaItem[]
    Coupons?: Coupons
}

export interface CardRequestModel {
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
                    CardRequest: CardRequest
                }
                orgName: ElementValue
            }
        }
    }
}

export interface CardResponseModel {
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
                    CardResponse: CardResponse
                }
            }
        }
    }
}

export interface ChequeRequestModel {
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
                    ChequeRequest: ChequeRequest
                }
                orgName: ElementValue
            }
        }
    }
}

export interface ChequeResponseModel {
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
                    ChequeResponse: ChequeResponse
                }
            }
        }
    }
}

export class CardSoapRequest implements CardRequestModel {
    public readonly 'soap:Envelope' = {
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
                    CardRequest: {
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

export class ChequeSoapRequest implements ChequeRequestModel {
    public readonly 'soap:Envelope' = {
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
}
