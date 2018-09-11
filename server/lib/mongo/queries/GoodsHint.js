"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GoodsHint {
    constructor(priceMin, priceMax) {
        if (priceMin && priceMax) {
            this.hint = 'priceMinMaxReg';
        }
        else if (priceMin) {
            this.hint = 'priceMinReg';
        }
        else if (priceMax) {
            this.hint = 'priceMaxReg';
        }
        else {
            this.hint = 'priceReg';
        }
    }
}
exports.GoodsHint = GoodsHint;
