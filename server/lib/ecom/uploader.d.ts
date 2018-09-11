export declare class EcomUploader {
    private categories;
    private stores;
    private orderStatuses;
    private payTypes;
    private goods;
    private stocks;
    private regions;
    uploadCategories(): Promise<void>;
    uploadStores(): Promise<void>;
    uploadOrderStatuses(): Promise<void>;
    uploadPayTypes(): Promise<void>;
    uploadGoods(): Promise<void>;
    uploadStocks(): Promise<void>;
}
