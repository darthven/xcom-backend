import * as appRoot from 'app-root-path'
import * as fs from 'fs'
import * as FtpClient from 'ftp'
import * as path from 'path'

import {
    FTP_CLIENT_HOST,
    FTP_CLIENT_PASSWORD,
    FTP_CLIENT_PORT,
    FTP_CLIENT_USER,
    IMAGE_TMP_FOLDER
} from '../config/env.config'
import logger from '../config/logger.config'

export async function uploadImage(imgLinkFTP: string) {
    return new Promise((resolve, reject) => {
        const client = new FtpClient()
        client.on('ready', () => {
            const ftp = path.join(path.basename(path.dirname(imgLinkFTP)), path.basename(imgLinkFTP))
            const destination = `${appRoot}/${IMAGE_TMP_FOLDER}/${path.basename(imgLinkFTP)}`
            client.get(ftp, (err, stream) => {
                if (err || !stream) {
                    logger.error(`${imgLinkFTP} was failed.`)
                    client.end()
                    reject(err)
                } else {
                    stream.once('close', () => {
                        logger.debug(`${imgLinkFTP} was uploaded.`)
                        client.end()
                    })
                    stream.pipe(fs.createWriteStream(destination))
                    resolve(destination)
                }
            })
        })
        client.connect({
            host: FTP_CLIENT_HOST,
            port: FTP_CLIENT_PORT,
            user: FTP_CLIENT_USER,
            password: FTP_CLIENT_PASSWORD
        })
    })
}
