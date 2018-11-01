"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sharp = require("sharp");
const env_config_1 = require("../config/env.config");
const logger_config_1 = require("../config/logger.config");
async function saveM(from, to) {
    await sharp(from)
        .background({ r: 255, g: 255, b: 255, alpha: 1 })
        .flatten()
        .resize(250, 250)
        .max()
        .withoutEnlargement()
        .jpeg({ quality: 90 })
        .toFile(to);
    logger_config_1.default.info('image saved', { name: to });
}
async function saveS(from, to) {
    await sharp(from)
        .background({ r: 255, g: 255, b: 255, alpha: 1 })
        .flatten()
        .resize(30, 30)
        .max()
        .withoutEnlargement()
        .jpeg({ quality: 100 })
        .toFile(to);
    logger_config_1.default.info('image saved', { name: to });
}
async function save(from, to) {
    await sharp(from)
        .background({ r: 255, g: 255, b: 255, alpha: 1 })
        .flatten()
        .resize(1920, 1920)
        .max()
        .withoutEnlargement()
        .jpeg({ progressive: true })
        .toFile(to);
    logger_config_1.default.info('image saved', { name: to });
}
async function saveGoodImage(from, id) {
    const to = `${env_config_1.IMAGE_FOLDER}${env_config_1.IMAGE_GOOD_FOLDER}${id}.jpeg`;
    const toS = `${env_config_1.IMAGE_FOLDER}${env_config_1.IMAGE_GOOD_FOLDER}${env_config_1.IMAGE_S_SUBFOLDER}${id}.jpeg`;
    const toM = `${env_config_1.IMAGE_FOLDER}${env_config_1.IMAGE_GOOD_FOLDER}${env_config_1.IMAGE_M_SUBFOLDER}${id}.jpeg`;
    await save(from, to);
    await saveS(from, toS);
    await saveM(from, toM);
}
exports.saveGoodImage = saveGoodImage;
