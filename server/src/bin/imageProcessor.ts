import * as appRoot from 'app-root-path'
import * as fs from 'fs'
import * as path from 'path'
import * as sharp from 'sharp'
import logger from '../config/logger.config'

async function saveM(from: string, to: string) {
    await sharp(from)
        .resize(250, 250)
        .max()
        .withoutEnlargement()
        .jpeg({ quality: 90 })
        .toFile(to)
    logger.info('image saved', { name: to })
}

async function saveS(from: string, to: string) {
    await sharp(from)
        .resize(30, 30)
        .max()
        .withoutEnlargement()
        .jpeg({ quality: 100 })
        .toFile(to)
    logger.info('image saved', { name: to })
}

function fileExists(filename: string): boolean {
    try {
        return fs.statSync(filename).isFile()
    } catch (err) {
        return false
    }
}

function run() {
    const from = `${appRoot}/images/goods`
    const to = `${appRoot}/images/m/`
    const files = fs.readdirSync(from)
    let i = 0
    for (const file of files) {
        const base = path.basename(file, path.extname(file))
        saveM(`${from}/${file}`, `${to}${base}.jpeg`)
        i++
    }
}

run()
