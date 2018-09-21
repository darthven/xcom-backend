import * as fs from 'fs'
import { IMAGE_FOLDER, IMAGE_GOOD_FOLDER } from '../config/env.config'

function fileExists(filename: string): boolean {
    try {
        return fs.statSync(filename).isFile()
    } catch (err) {
        return false
    }
}

export function goodImageExist(id: number) {
    const file = `${IMAGE_FOLDER}${IMAGE_GOOD_FOLDER}${id}.jpeg`
    return fileExists(file)
}
