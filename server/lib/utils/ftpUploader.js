"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appRoot = require("app-root-path");
const fs = require("fs");
const FtpClient = require("ftp");
const path = require("path");
const env_config_1 = require("../config/env.config");
const logger_config_1 = require("../config/logger.config");
async function uploadImage(imgLinkFTP) {
    return new Promise((resolve, reject) => {
        const client = new FtpClient();
        client.on('ready', () => {
            const ftp = path.join(path.basename(path.dirname(imgLinkFTP)), path.basename(imgLinkFTP));
            const destination = `${appRoot}/${env_config_1.IMAGE_TMP_FOLDER}/${path.basename(imgLinkFTP)}`;
            client.get(ftp, (err, stream) => {
                if (err || !stream) {
                    logger_config_1.default.error(`${imgLinkFTP} was failed.`);
                    client.end();
                    reject(err);
                }
                else {
                    stream.once('close', () => {
                        resolve(destination);
                        logger_config_1.default.debug(`${imgLinkFTP} was uploaded.`);
                        client.end();
                    });
                    stream.pipe(fs.createWriteStream(destination));
                }
            });
        });
        client.connect({
            host: env_config_1.FTP_CLIENT_HOST,
            port: env_config_1.FTP_CLIENT_PORT,
            user: env_config_1.FTP_CLIENT_USER,
            password: env_config_1.FTP_CLIENT_PASSWORD
        });
    });
}
exports.uploadImage = uploadImage;
