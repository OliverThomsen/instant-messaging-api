"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io");
class SocketHandler {
    constructor(server, dataBase) {
        this.activeUserSockets = {};
        this.io = io(server, { serveClient: false });
        this.io.on('connection', socket => this.handleSocket(socket));
        this.dataBase = dataBase;
    }
    handleSocket(socket) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('New socket connection:', socket.id);
            const userID = socket.handshake.query.userID;
            const user = yield this.dataBase.getUser(userID);
            this.referenceSocketToUser(socket, userID);
            yield this.subscribeSocketToChats(socket, userID);
            socket.on('message', (data) => __awaiter(this, void 0, void 0, function* () {
                const message = yield this.dataBase.createMessage(data.chatID, userID, data.content);
                this.io.to(data.chatID).emit('message', message);
            }));
            socket.on('typing', (data) => {
                socket.broadcast.to(data.chatID).emit('typing', { username: user.username, chatID: data.chatID });
            });
            socket.on('disconnect', () => {
                const i = this.activeUserSockets[userID].indexOf(socket);
                this.activeUserSockets[userID].splice(i, 1);
                console.log('Socket disconnected:', socket.id);
            });
        });
    }
    subscribeUsersToChat(chat, usersIDs) {
        usersIDs.forEach(id => {
            if (this.activeUserSockets[id]) {
                this.activeUserSockets[id].forEach(socket => {
                    socket.join(chat.id, (err) => {
                        if (err)
                            throw err;
                    });
                });
            }
        });
    }
    referenceSocketToUser(socket, userID) {
        if (!this.activeUserSockets[userID]) {
            this.activeUserSockets[userID] = [];
        }
        this.activeUserSockets[userID].push(socket);
    }
    subscribeSocketToChats(socket, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const chatIDs = yield this.dataBase.getUserChatIDs(userID);
            chatIDs.forEach((chatID) => {
                socket.join(chatID, (err) => {
                    if (err)
                        throw err;
                });
            });
        });
    }
}
exports.SocketHandler = SocketHandler;
//# sourceMappingURL=SocketHandler.js.map