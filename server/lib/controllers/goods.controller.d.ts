import { ProductFilter } from '../parameters/productFilter';
import { Region } from '../parameters/region';
import { SkipTake } from '../parameters/skipTake';
export declare class AuthController {
    private goods;
    private stocks;
    getGoods(skipTake: SkipTake, region: Region, filter: ProductFilter): Promise<{
        length: number;
        categories: any;
        density: any[];
        data: any[];
    }>;
    getSingle(id: number, region: Region): Promise<any[]>;
}
