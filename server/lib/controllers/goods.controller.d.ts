import { Ids } from '../parameters/ids';
import { ProductFilter } from '../parameters/productFilter';
import { Region } from '../parameters/region';
import { SkipTake } from '../parameters/skipTake';
export declare class GoodsController {
    private goods;
    getGoods(skipTake: SkipTake, region: Region, filter: ProductFilter): Promise<{
        length: number;
        categories: any;
        density: any[];
        price: any;
        data: any[];
    }>;
    getGoodsData(skipTake: SkipTake, region: Region, filter: ProductFilter): Promise<{
        length: number;
        data: any[];
    }>;
    getGoodsInfo(skipTake: SkipTake, region: Region, filter: ProductFilter): Promise<{
        length: number;
        categories: any;
        density: any[];
        price: any;
    }>;
    getGoodsByBarcode(id: string, region: Region): Promise<any[]>;
    getSingle(id: number, region: Region): Promise<any>;
    getGoodsByIds(ids: Ids, region: Region): Promise<any[]>;
}
