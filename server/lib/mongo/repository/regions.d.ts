import { Repository } from './repository';
export declare class RegionsRepository extends Repository {
    constructor();
    createCollection(): Promise<void>;
    getAll(): Promise<any[]>;
    getSingle(id: number): Promise<any[]>;
    getRegionByLatLng(lat: number, lng: number): Promise<any[]>;
}
