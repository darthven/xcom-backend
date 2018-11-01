import { ChequeRequest } from '../common/checkRequest';
export declare class ChequeController {
    private readonly soapUtil;
    handleSoftCheque(request: ChequeRequest, type: string): Promise<import("../utils/soapDefinitions").ChequeResponseModel>;
}
