export interface StoreType {
    name: string
    img: string
    /**
     * Total count across all regions
     */
    count: string

    /**
     * Count in regions
     */
    regions: Array<{ region: number; count: number }>
}
