import * as appRoot from 'app-root-path'
import * as fs from 'fs'
import { Container } from 'typedi'
import { Station } from '../mongo/entity/station'
import { StationsRepository } from '../mongo/repository/stations'

export default async () => {
    const stationsRepo = Container.get(StationsRepository)
    const stations: Station[] = JSON.parse(fs.readFileSync(`${appRoot}/data/stations.json`, 'utf8'))
    await stationsRepo.dropCollection()
    await stationsRepo.createCollection()
    await stationsRepo.collection.insertMany(stations)
    return { inserted: stations.length }
}
