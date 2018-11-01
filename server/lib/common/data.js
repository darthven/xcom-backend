"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const admin_1 = require("../mongo/entity/admin");
const ADMINS = [
    new admin_1.Admin('admin', bcrypt.hashSync('admin', bcrypt.genSaltSync(10))),
    new admin_1.Admin('test', bcrypt.hashSync('test', bcrypt.genSaltSync(10)))
];
exports.ADMINS = ADMINS;
