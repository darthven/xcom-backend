import { Station } from '../mongo/entity/station';
import { Store, StoreStation } from '../mongo/entity/store';
export declare function getStationsInRadius(stations: Station[], store: Store, radius: number): StoreStation[];
