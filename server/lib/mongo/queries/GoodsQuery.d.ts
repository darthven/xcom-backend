export declare class GoodsQuery {
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
    };
    $or?: [{
        price: null;
    }, {
        price: {
            $elemMatch: {
                region: number;
            };
        };
    }];
    constructor(region: number, search?: string, categories?: number[], priceMin?: number, priceMax?: number);
}
