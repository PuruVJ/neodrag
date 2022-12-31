"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeMessagesFromSocket = void 0;
function consumeMessagesFromSocket(callback) {
    let message = '';
    return (data) => {
        const chunk = data.toString();
        if (chunk.codePointAt(chunk.length - 1) === 4) {
            message += chunk.substring(0, chunk.length - 1);
            callback(message);
            message = '';
        }
        else {
            message += chunk;
        }
    };
}
exports.consumeMessagesFromSocket = consumeMessagesFromSocket;
//# sourceMappingURL=consume-messages-from-socket.js.map