export declare class GoodsNullQuery {
    $text?: {
        $search: string;
    };
    siteCatId?: {
        $in: number[];
    };
    price: null;
    'share.id'?: {
        $in: number[];
    };
    'share.endDate'?: {
        $gt: Date;
    };
    'share.regions'?: {
        $in: number[];
    };
    constructor(region: number, search?: string, categories?: number[], shares?: number[]);
}
