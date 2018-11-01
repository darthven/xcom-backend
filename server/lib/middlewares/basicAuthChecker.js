"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth = require("basic-auth");
const bcrypt = require("bcrypt");
require("reflect-metadata");
const typedi_1 = require("typedi");
const admins_1 = require("../mongo/repository/admins");
exports.authorizationChecker = async (action, roles) => {
    const request = action.request;
    const user = auth(request);
    if (user) {
        const admin = await typedi_1.Container.get(admins_1.AdminsRepository).collection.findOne({
            username: user.name
        });
        if (admin && bcrypt.compareSync(user.pass, admin.password)) {
            return true;
        }
    }
    return false;
};
