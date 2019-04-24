"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RandomKey = /** @class */ (function () {
    function RandomKey() {
    }
    RandomKey.setKey = function (key) {
        this.randomKey = key;
    };
    RandomKey.getKey = function () {
        return this.randomKey;
    };
    return RandomKey;
}());
exports.RandomKey = RandomKey;
