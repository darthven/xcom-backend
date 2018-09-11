import { LocationFilter } from '../../parameters/locationFilter'

export class LocationsQuery {
    public storeType?: string
    public regionCode: number

    constructor(filter: LocationFilter) {
        if (filter.type) {
            this.storeType = filter.type
        }
        this.regionCode = filter.region
    }
}
