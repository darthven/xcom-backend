"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ids_1 = require("../parameters/ids");
class IdsInjectMiddleware {
    async use(context, next) {
        context.state.ids = new ids_1.Ids(context.query);
        return next();
    }
}
exports.IdsInjectMiddleware = IdsInjectMiddleware;
