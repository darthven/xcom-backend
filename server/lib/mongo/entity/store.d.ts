import { Location } from './location';
import { Station } from './station';
export declare class StoreStation {
    id: number;
    name: string;
    location: Location;
    city: string;
    distance: number;
    line: {
        name: string;
        color: string;
    };
    constructor(station: Station, distance: number);
}
export interface Store {
    id: number;
    name: string;
    GUID: string;
    tradePointCode: string;
    storeType: string;
    networkName: string;
    GPS: string;
    workTime: string;
    regionCode: number;
    region: string;
    openDate: string;
    address: string;
    phoneNumber: string;
    email: string;
    active: boolean;
    INN: string;
    changeDate: string;
    location: Location;
    stations: StoreStation;
}
