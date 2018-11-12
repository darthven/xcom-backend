import * as fs from 'fs'
import {
    IMAGE_CATEGORIES_FOLDER,
    IMAGE_CATEGORY_TYPE,
    IMAGE_DEFAULT_TYPE,
    IMAGE_FOLDER,
    IMAGE_GOOD_FOLDER
} from '../config/env.config'

function fileExists(filename: string): boolean {
    try {
        return fs.statSync(filename).isFile()
    } catch (err) {
        return false
    }
}

export function goodImageExist(id: number) {
    const file = `${IMAGE_FOLDER}${IMAGE_GOOD_FOLDER}${id}${IMAGE_DEFAULT_TYPE}`
    return fileExists(file)
}

export function categoryImageExist(id: number) {
    const name = `${id}${IMAGE_CATEGORY_TYPE}`
    const file = `${IMAGE_FOLDER}${IMAGE_CATEGORIES_FOLDER}${name}`
    if (fileExists(file)) {
        return name
    }
    return null
}
