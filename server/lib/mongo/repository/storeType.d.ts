import { Repository } from './repository';
export declare class StoreTypeRepository extends Repository {
    constructor();
    createCollection(): Promise<void>;
    getAll(): Promise<any[]>;
    getAllByRegion(region: number): Promise<any[]>;
}
