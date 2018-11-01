export declare class EcomUpdater {
    static makePrefixes(value: string): string[];
    private categories;
    private stores;
    private orderStatuses;
    private payTypes;
    private goods;
    private stations;
    private regions;
    private storeTypes;
    updateCategories(): Promise<void>;
    updateStores(): Promise<void>;
    updateOrderStatuses(): Promise<void>;
    updatePayTypes(): Promise<void>;
    updateGoods(): Promise<void>;
    updateStocks(): Promise<void>;
    updatePrices(): Promise<void>;
    updateStoreLocations(): Promise<void>;
    updateStations(): Promise<void>;
    updateRegionsPoly(): Promise<void>;
    updateStoreTypes(): Promise<void>;
    updateImages(): Promise<void>;
    updateStationsNearStore(): Promise<void>;
    private recursiveCategoryCount;
    private updateSingleGood;
}
