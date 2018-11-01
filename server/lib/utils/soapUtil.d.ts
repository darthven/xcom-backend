import { ChequeRequest } from '../common/checkRequest';
import { ChequeResponseModel } from './soapDefinitions';
interface SoapHeaders {
    'user-agent'?: string;
    'Content-Type'?: string;
    soapAction?: string;
}
export default class SoapUtil {
    sendRequestFromXml(url: string, xml: string, headers?: SoapHeaders): Promise<ChequeResponseModel>;
    sendRequestFromFile(url: string, pathToXml: string, headers?: SoapHeaders): Promise<ChequeResponseModel>;
    updateObjectValue<T>(property: string, value: T, object: any, index?: number): void;
    addObjectProperty<T>(property: string, value: T, object: any, parentProperty: string): void;
    createChequeRequest(chequeRequest: ChequeRequest, type: string): string;
    private addItems;
    private addCoupons;
    private sendRequest;
    private getXmlRequestDataFromFile;
    private soapRequest;
}
export {};
