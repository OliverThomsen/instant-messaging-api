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
const AuthenticationError_1 = require("./errors/AuthenticationError");
class RestApi {
    constructor(database, authService, socketHandler) {
        this.database = database;
        this.authService = authService;
        this.socketHandler = socketHandler;
    }
    handleRoutes(router) {
        router.post('/login', (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.body.username || req.body.username.length === 0) {
                    yield res.status(400).json({ error: 'Username is required' });
                }
                else {
                    const id = yield this.authService.login(req.body.username);
                    yield res.json({ id });
                }
            }
            catch (error) {
                yield this.handleError(error, res);
            }
        }));
        router.get('/users', (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const username = req.query ? req.query.username : '';
                const users = yield this.database.searchUsers(username);
                yield res.json(users);
            }
            catch (error) {
                yield this.handleError(error, res);
            }
        }));
        router.post('/users', (req, res) => __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            try {
                if (!req.body.username) {
                    yield res.status(400).json({ error: 'Username is required' });
                }
                else if (req.body.username.length < 3) {
                    yield res.status(400).json({ error: 'Username must be more than 3 characters' });
                }
                else {
                    const user = yield this.database.createUser(req.body.username);
                    yield res.json(user);
                }
            }
            catch (error) {
                yield this.handleError(error, res);
            }
        }));
        router.get('/users/:id/chats', (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const chats = yield this.database.getUserChats(parseInt(req.params.id));
                yield res.json(chats);
            }
            catch (error) {
                yield this.handleError(error, res);
            }
        }));
        router.post('/chats', (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const chat = yield this.database.createChat(req.body.usernames, req.body.userID);
                this.socketHandler.subscribeUsersToChat(chat, req.body.usernames);
                yield res.json(chat);
            }
            catch (error) {
                yield this.handleError(error, res);
            }
        }));
        router.get('/chats/:id/messages', (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const messages = yield this.database.getChatMessages(req.params.id);
                yield res.json(messages);
            }
            catch (error) {
                yield this.handleError(error, res);
            }
        }));
        return router;
    }
    handleError(error, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (error instanceof AuthenticationError_1.default) {
                yield res.status(400).json({ error: error.message });
            }
            else {
                yield res.status(500).json({ error: 'Sorry something went wrong' });
            }
        });
    }
}
exports.RestApi = RestApi;
//# sourceMappingURL=RestApi.js.map