"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const net_1 = __importDefault(require("net"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const msgpack_1 = require("@msgpack/msgpack");
class Client {
    constructor(sockPath) {
        this.sockPath = this.formatSockPath(sockPath);
    }
    request(action) {
        const socketClient = net_1.default.createConnection(this.sockPath);
        return new Promise((resolve, reject) => {
            socketClient.write(msgpack_1.encode(action));
            socketClient.on("data", (data) => {
                resolve(msgpack_1.decode(data));
                socketClient.destroy();
            });
            socketClient.on("error", (err) => {
                if (err.errno === -61) {
                    reject("Can not find server.");
                }
                else {
                    reject(err);
                }
                socketClient.destroy();
            });
        });
    }
    formatSockPath(sockPath) {
        if (os_1.default.platform() === "win32") {
            return path_1.default.join("\\\\?\\pipe", sockPath);
        }
        else {
            return sockPath;
        }
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map