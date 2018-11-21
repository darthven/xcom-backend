const pipes: { [index: string]: Array<string | string[]> } = {
    initialPipe: ['loadStations', ['storesPipe', 'goodsPipe'], 'stocksPipe'],
    dailyPipe: [['storesPipe', 'goodsPipe'], 'stocksPipe'],
    storesPipe: ['updateStores', ['updateStoreTypes', 'updateStationsNearStore', 'updateRegions']],
    goodsPipe: ['updateGoods', ['updateCategories', 'updateGoodsImages']],
    stocksPipe: ['updateStocks', 'updatePricesIndex']
}

export default pipes
