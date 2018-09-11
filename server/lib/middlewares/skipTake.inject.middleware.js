"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const skipTake_1 = require("../parameters/skipTake");
class SkipTakeInjectMiddleware {
    async use(context, next) {
        context.state.skipTake = new skipTake_1.SkipTake(context.query);
        return next();
    }
}
exports.SkipTakeInjectMiddleware = SkipTakeInjectMiddleware;
