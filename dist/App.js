"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const SocketHandler_1 = require("./SocketHandler");
const RestApi_1 = require("./RestApi");
const DataBase_1 = require("./DataBase");
const AuthService_1 = require("./AuthService");
class App {
    constructor(port) {
        const app = express();
        const router = express.Router();
        const dataBase = new DataBase_1.DataBase();
        const authService = new AuthService_1.AuthService(dataBase);
        const server = app.listen(port);
        const socketHandler = new SocketHandler_1.SocketHandler(server, dataBase);
        const api = new RestApi_1.RestApi(dataBase, authService, socketHandler);
        // Apply middle wear
        app.use(bodyParser.json());
        app.use('/api', api.handleRoutes(router));
        router.get('/', (req, res) => res.json({ message: 'Welcome to the Instant Messaging API' }));
    }
}
exports.App = App;
//# sourceMappingURL=App.js.map