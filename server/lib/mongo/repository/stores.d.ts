import { LocationsQuery } from '../queries/LocationsQuery';
import { Repository } from './repository';
export declare class StoreRepository extends Repository {
    constructor();
    createCollection(): Promise<void>;
    getMinMax(): Promise<any[]>;
    getAll(query: LocationsQuery): Promise<any[]>;
    getSingle(id: number): Promise<any[]>;
    getLocationsType(): Promise<any[]>;
    getRegions(): Promise<any[]>;
    getRee(): Promise<any[]>;
}
