import { path } from 'app-root-path'
import * as fs from 'fs'
import * as fsPath from 'path'

import {
    IMAGE_CATEGORIES_FOLDER,
    IMAGE_FOLDER,
    IMAGE_GOOD_FOLDER,
    IMAGE_M_SUBFOLDER,
    IMAGE_S_SUBFOLDER,
    IMAGE_STORE_TYPE_FOLDER,
    IMAGE_TMP_FOLDER,
    LOGS_FOLDER,
    NODE_ENV
} from '../config/env.config'
import logger from '../config/logger.config'

const dirs = [`${path}/${IMAGE_TMP_FOLDER}`, `${path}/${LOGS_FOLDER}`]

dirs.push(
    `${IMAGE_FOLDER}`,
    `${IMAGE_FOLDER}${IMAGE_CATEGORIES_FOLDER}`,
    `${IMAGE_FOLDER}${IMAGE_STORE_TYPE_FOLDER}`,
    `${IMAGE_FOLDER}${IMAGE_GOOD_FOLDER}`,
    `${IMAGE_FOLDER}${IMAGE_GOOD_FOLDER}${IMAGE_M_SUBFOLDER}`,
    `${IMAGE_FOLDER}${IMAGE_GOOD_FOLDER}${IMAGE_S_SUBFOLDER}`
)

const makeDir = (pathToCreate: string) => {
    pathToCreate.split(fsPath.sep).reduce((currentPath, folder) => {
        currentPath += folder + fsPath.sep
        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath)
        }
        return currentPath
    }, '')
}

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        makeDir(dir)
        logger.debug(`Folder was created: ${dir}`)
    }
})
