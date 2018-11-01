import { Region } from '../../parameters/region';
import { SkipTake } from '../../parameters/skipTake';
import { Share } from '../entity/share';
import { GoodsHint } from '../queries/GoodsHint';
import { GoodsNullQuery } from '../queries/GoodsNullQuery';
import { GoodsSort } from '../queries/GoodsSort';
import { GoodsStrictQuery } from '../queries/GoodsStrictQuery';
import { Repository } from './repository';
export declare class GoodRepository extends Repository {
    private firstProject;
    private secondProject;
    private lookup;
    constructor();
    createCollection(): Promise<void>;
    updateImageLink(id: number): Promise<import("mongodb").UpdateWriteOpResult>;
    updateIndexes(): Promise<void>;
    getAll(match: GoodsStrictQuery, withoutPriceMatch: GoodsNullQuery, skipTake: SkipTake, region: Region, sort: GoodsSort, hint: GoodsHint): Promise<{
        fullLength: number;
        data: any[];
    }>;
    getAllWithPrice(match: GoodsStrictQuery, skipTake: SkipTake, region: Region, sort: GoodsSort): Promise<any[]>;
    getAllWithoutPrice(match: GoodsNullQuery, skipTake: SkipTake, sort: GoodsSort): Promise<any[]>;
    getByIds(ids: number[], region: Region): Promise<any[]>;
    getSingle(id: number, region: Region): Promise<any[]>;
    getLength(match: GoodsStrictQuery, hint: GoodsHint): Promise<number>;
    getByBarcode(barcode: string, region: Region): Promise<any[]>;
    getCategories(match: GoodsStrictQuery, hint: GoodsHint): Promise<any>;
    getMinMaxPrice(match: GoodsStrictQuery, region: Region, hint: GoodsHint): Promise<any>;
    getDensity(match: GoodsStrictQuery, region: Region, hint: GoodsHint, max?: number): Promise<any[]>;
    setShare(share: Share): Promise<import("mongodb").FindAndModifyWriteOpResultObject<any>>;
}
