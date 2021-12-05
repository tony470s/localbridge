"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const net_1 = __importDefault(require("net"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const msgpack_1 = require("@msgpack/msgpack");
const Socket_1 = require("./Socket");
class Server {
    constructor(sockPath) {
        this.sockPath = this.formatSockPath(sockPath);
        this.socketServer = this.createSocketServer();
        this.handlers = new Map();
    }
    addHandler(type, handler) {
        this.handlers.set(type, handler);
        return true;
    }
    serve() {
        return new Promise((resolve) => {
            try {
                fs_1.default.unlinkSync(this.sockPath);
            }
            catch (error) {
                if (error.code !== "ENOENT") {
                    console.warn("Error occurred: %s", error);
                }
            }
            this.socketServer.listen(this.sockPath);
            console.log("Serving at: ", this.sockPath);
            resolve(true);
        });
    }
    close() {
        this.socketServer.close((err) => {
            if (err !== undefined) {
                console.warn(`Error occurred: ${err}`);
            }
        });
        return true;
    }
    createSocketServer() {
        return net_1.default.createServer((socket) => {
            socket.on("error", function (exception) {
                console.error("Error occurred:" + exception);
                socket.end();
            });
            socket.on("close", (had_error) => {
                console.log("Client closed!", had_error);
            });
            socket.on("connect", () => {
                console.log("Client connected: ", socket);
            });
            socket.on("lookup", () => {
                console.log("Client lookup: ", socket);
            });
            socket.on("data", (data) => {
                let action = null;
                try {
                    action = msgpack_1.decode(data);
                    console.log("Receiving data from client:", JSON.stringify(action));
                }
                catch (error) {
                    console.log("Error occurred: ", error);
                    socket.write(msgpack_1.encode({
                        error: { code: -1, desc: "Invalid param!" },
                        payload: null,
                    }));
                    return;
                }
                const handler = this.handlers.get(action.type);
                if (handler !== undefined) {
                    handler(new Socket_1.Socket(socket), action);
                }
                else {
                    socket.write(msgpack_1.encode({
                        error: {
                            code: -2,
                            desc: "Can not find handler.",
                        },
                        payload: {},
                    }));
                }
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
exports.Server = Server;
//# sourceMappingURL=Server.js.map