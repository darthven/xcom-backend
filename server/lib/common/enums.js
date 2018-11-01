"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageType;
(function (MessageType) {
    MessageType[MessageType["STARTED"] = 0] = "STARTED";
    MessageType[MessageType["FINISHED"] = 1] = "FINISHED";
    MessageType[MessageType["FAILED"] = 2] = "FAILED";
})(MessageType || (MessageType = {}));
exports.MessageType = MessageType;
