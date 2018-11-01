import { Repository } from './repository';
export declare class SharesRepository extends Repository {
    private goods;
    constructor();
    createCollection(): Promise<void>;
    saveShares(csvFile: any): Promise<any>;
    getAll(): Promise<any[]>;
}
