import { Repository } from './repository';
export declare class StationsRepository extends Repository {
    constructor();
    createCollection(): Promise<void>;
    getAll(): Promise<any[]>;
    getSingle(id: number): Promise<any[]>;
}
