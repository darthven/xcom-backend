import { Location } from './location'
import { Station } from './station'

export class StoreStation {
    public id: number
    public name: string
    public location: Location
    public city: string
    public distance: number
    public line: { name: string; color: string }

    constructor(station: Station, distance: number) {
        this.id = station.id
        this.name = station.name
        this.location = station.location
        this.distance = distance
        this.city = station.city
        this.line = station.line
    }
}

export interface Store {
    id: number
    name: string
    GUID: string
    tradePointCode: string
    storeType: string
    networkName: string
    GPS: string
    workTime: string
    regionCode: number
    region: string
    openDate: string
    address: string
    phoneNumber: string
    email: string
    active: boolean
    INN: string
    changeDate: string
    location: Location
    stations: StoreStation
}
