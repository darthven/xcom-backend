import * as sharp from 'sharp'
import logger from '../config/logger.config'

async function save(from: string, to: string) {
    await sharp(from)
        .background({ r: 255, g: 255, b: 255, alpha: 1 })
        .flatten()
        .resize(1920, 1920)
        .max()
        .withoutEnlargement()
        .jpeg({ progressive: true })
        .toFile(to)
    logger.info('image saved', { name: to })
}
