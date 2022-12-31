"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketMessenger = void 0;
const tslib_1 = require("tslib");
const consume_messages_from_socket_1 = require("../../utils/consume-messages-from-socket");
class SocketMessenger {
    constructor(socket) {
        this.socket = socket;
    }
    sendMessage(messageToDaemon) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.socket.write(JSON.stringify(messageToDaemon));
            // send EOT to indicate that the message has been fully written
            this.socket.write(String.fromCodePoint(4));
        });
    }
    listen(onData, onClose = () => { }, onError = (err) => { }) {
        this.socket.on('data', (0, consume_messages_from_socket_1.consumeMessagesFromSocket)((message) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            onData(message);
        })));
        this.socket.on('close', onClose);
        this.socket.on('error', onError);
        return this;
    }
    close() {
        this.socket.destroy();
    }
}
exports.SocketMessenger = SocketMessenger;
//# sourceMappingURL=socket-messenger.js.map