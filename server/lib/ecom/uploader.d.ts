export declare class EcomUploader {
    private categories;
    private stores;
    private orderStatuses;
    private payTypes;
    private goods;
    private stations;
    private regions;
    private storeTypes;
    uploadCategories(): Promise<void>;
    uploadStores(): Promise<void>;
    uploadRegions(): Promise<void>;
    uploadStoreTypes(): Promise<void>;
    uploadOrderStatuses(): Promise<void>;
    uploadPayTypes(): Promise<void>;
    uploadGoods(): Promise<void>;
    uploadStations(): Promise<void>;
}
