import { Container } from 'typedi'
import logger from '../config/logger.config'
import { GoodRepository } from '../mongo/repository/goods'
import { goodImageExist } from '../utils/fileExist'
import { downloadImage } from '../utils/ftpUploader'
import { saveGoodImage } from '../utils/imageSaver'

/**
 * Before: updateGoods
 */
export default async () => {
    const goodsRepo = Container.get(GoodRepository)

    let success = 0
    let skipped = 0
    let errors = 0

    const goodsCursor = goodsRepo.collection.find({})
    while (await goodsCursor.hasNext()) {
        const item = await goodsCursor.next()
        if (goodImageExist(item.id)) {
            // todo checksum?
            logger.debug(`already have images for ${item.id}, skipping...`)
            skipped++
            continue
        }
        if (item.imgLinkFTP) {
            // upload image from ftp
            try {
                const tmpFile = await downloadImage(item.imgLinkFTP)
                await saveGoodImage(tmpFile, item.id)
                await goodsRepo.updateImageLink(item.id)
                success++
                logger.debug(`generated all images for ${item.id}`)
            } catch (e) {
                errors++
                logger.error('err while updating image', { err: e.message })
            }
        } else {
            logger.debug(`item ${item.id} does not have image link, skipping...`)
            skipped++
        }
    }

    return { success, errors, skipped }
}
