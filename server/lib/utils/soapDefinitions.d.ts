interface ElementValue {
    _text: string;
}
interface Item {
    PositionNumber: ElementValue;
    Article: ElementValue;
    Price: ElementValue;
    Quantity: ElementValue;
    Summ: ElementValue;
    Discount: ElementValue;
    SummDiscounted: ElementValue;
}
interface Coupons {
    Coupon: [{
        Number: ElementValue;
    }, {
        EmissionId: ElementValue;
    }, {
        TypeId: ElementValue;
    }];
}
interface ChequeRequestModel {
    'soap:Envelope': {
        _attributes: {
            'xmlns:xsi': string;
            'xmlns:xsd': string;
            'xmlns:soap': string;
        };
        'soap:Body': {
            ProcessRequest: {
                _attributes: {
                    xmlns: string;
                };
                request: {
                    ChequeRequest: {
                        _attributes: {
                            ChequeType: string;
                        };
                        RequestID: ElementValue;
                        DateTime: ElementValue;
                        Organization: ElementValue;
                        BusinessUnit: ElementValue;
                        POS: ElementValue;
                        Card: {
                            CardNumber: ElementValue;
                        };
                        Number: ElementValue;
                        OperationType: ElementValue;
                        Summ: ElementValue;
                        Discount: ElementValue;
                        SummDiscounted: ElementValue;
                        PaidByBonus: ElementValue;
                        Items?: {
                            Item: Item[];
                        };
                        Coupons?: Coupons;
                    };
                };
                orgName: ElementValue;
            };
        };
    };
}
interface ChequeResponseModel {
    _declaration: {
        _attributes: {
            version: string;
            encoding: string;
        };
    };
    'soap:Envelope': {
        _attributes: {
            'xmlns:soap': string;
            'xmlns:xsi': string;
            'xmlns:xsd': string;
        };
        'soap:Body': {
            ProcessRequestResponse: {
                _attributes: {
                    xmlns: string;
                };
                ProcessRequestResult: {
                    ChequeResponse: {
                        TransactionID: ElementValue;
                        RequestID: ElementValue;
                        Processed: ElementValue;
                        ReturnCode: ElementValue;
                        Message: ElementValue;
                        CardBalance: ElementValue;
                        CardNormalBalance: ElementValue;
                        CardStatusBalance: ElementValue;
                        CardActiveBalance: ElementValue;
                        CardNormalActiveBalance: ElementValue;
                        CardStatusActiveBalance: ElementValue;
                        CardSumm: ElementValue;
                        CardDiscount: ElementValue;
                        CardChargedMoney: ElementValue;
                        CardWriteoffMoney: ElementValue;
                        CardMoneyBalance: ElementValue;
                        Summ: ElementValue;
                        Discount: ElementValue;
                        SummDiscounted: ElementValue;
                        ChargedBonus: ElementValue;
                        ActiveChargedBonus: ElementValue;
                        ChargedStatusBonus: ElementValue;
                        ActiveChargedStatusBonus: ElementValue;
                        AvailablePayment: ElementValue;
                        WriteoffBonus: ElementValue;
                        Items?: {
                            Item: Item[];
                        };
                    };
                };
            };
        };
    };
}
declare const CHEQUE_REQUEST: ChequeRequestModel;
export { Item, Coupons, ChequeRequestModel, ChequeResponseModel, CHEQUE_REQUEST };
