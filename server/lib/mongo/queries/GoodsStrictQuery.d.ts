export declare class GoodsStrictQuery {
    $text?: {
        $search: string;
    };
    siteCatId?: {
        $in: number[];
    };
    price?: {
        $elemMatch: {
            region: number;
            priceMax: {
                $gt: number;
            };
            priceMin: {
                $lt: number;
            };
        };
    } | {
        $elemMatch: {
            region: number;
        };
    };
    'share.id'?: {
        $in: number[];
    };
    'share.endDate'?: {
        $gt: Date;
    };
    'share.regions'?: {
        $in: number[];
    };
    constructor(region: number, search?: string, categories?: number[], priceMin?: number, priceMax?: number, shares?: number[]);
}
