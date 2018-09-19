import { Location } from './location'
import { Station } from './station'

export class StoreStation {
    public id: number
    public name: string
    public location: Location
    public distance: number

    constructor(station: Station, distance: number) {
        this.id = station.id
        this.name = station.name
        this.location = station.location
        this.distance = distance
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
