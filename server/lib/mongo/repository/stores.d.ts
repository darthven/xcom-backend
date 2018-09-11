import { Repository } from './repository';
export declare class StoreRepository extends Repository {
    constructor();
    createCollection(): Promise<void>;
    getMinMax(): Promise<any[]>;
}
