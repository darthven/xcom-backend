export declare class EcomUpdater {
    private categories;
    private stores;
    private orderStatuses;
    private payTypes;
    private goods;
    private stocks;
    private regions;
    updateCategories(): Promise<void>;
    updateStores(): Promise<void>;
    updateOrderStatuses(): Promise<void>;
    updatePayTypes(): Promise<void>;
    updateGoods(): Promise<void>;
    updateStocks(): Promise<void>;
    updatePrices(): Promise<void>;
}
