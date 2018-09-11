import { Region } from '../../parameters/region';
import { SkipTake } from '../../parameters/skipTake';
import { GoodsHint } from '../queries/GoodsHint';
import { GoodsQuery } from '../queries/GoodsQuery';
import { GoodsStrictQuery } from '../queries/GoodsStrictQuery';
import { Repository } from './repository';
export declare class GoodRepository extends Repository {
    constructor();
    createCollection(): Promise<void>;
    getAll(match: GoodsQuery, skipTake: SkipTake, region: Region): Promise<any[]>;
    getSingle(id: number, region: Region): Promise<any[]>;
    getLength(match: GoodsStrictQuery, hint: GoodsHint): Promise<number>;
    getCategories(match: GoodsStrictQuery, hint: GoodsHint): Promise<any>;
    getDensity(match: GoodsStrictQuery, region: Region, hint: GoodsHint): Promise<any[]>;
}
