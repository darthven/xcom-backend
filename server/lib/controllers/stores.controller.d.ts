import { LocationFilter } from '../parameters/locationFilter';
export declare class StoresController {
    private stores;
    getLocations(filter: LocationFilter): Promise<any[]>;
    getLocationById(id: number): Promise<any>;
    getRee(): Promise<any[]>;
}
