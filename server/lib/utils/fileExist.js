"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const env_config_1 = require("../config/env.config");
function fileExists(filename) {
    try {
        return fs.statSync(filename).isFile();
    }
    catch (err) {
        return false;
    }
}
function goodImageExist(id) {
    const file = `${env_config_1.IMAGE_FOLDER}${env_config_1.IMAGE_GOOD_FOLDER}${id}${env_config_1.IMAGE_DEFAULT_TYPE}`;
    return fileExists(file);
}
exports.goodImageExist = goodImageExist;
function categoryImageExist(id) {
    const name = `${id}${env_config_1.IMAGE_CATEGORY_TYPE}`;
    const file = `${env_config_1.IMAGE_FOLDER}${env_config_1.IMAGE_CATEGORIES_FOLDER}${name}`;
    if (fileExists(file)) {
        return name;
    }
    return null;
}
exports.categoryImageExist = categoryImageExist;
