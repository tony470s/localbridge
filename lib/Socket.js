"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
const msgpack_1 = require("@msgpack/msgpack");
class Socket {
    constructor(netSocket) {
        this.netSocket = netSocket;
    }
    write(data) {
        this.netSocket.write(msgpack_1.encode(data));
    }
}
exports.Socket = Socket;
//# sourceMappingURL=Socket.js.map