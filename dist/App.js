"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const SocketHandler_1 = require("./SocketHandler");
const RestApi_1 = require("./RestApi");
const DatabaseManager_1 = require("./DatabaseManager");
const AuthService_1 = require("./AuthService");
class App {
    constructor(serverPort) {
        // Production
        const username = "xsqrwfcwrvmsff";
        const password = "6d67098f8f3c47c7c0b9ee1bbfb7f5e14e08643108473f1f7e8615e38040b789";
        const database = "d687fmprvdip4p";
        const DBPort = 5432;
        const host = "ec2-54-227-249-201.compute-1.amazonaws.com";
        // Localhost
        // const username = "postgres";
        // const password = "password";
        // const database = "instant_messaging";
        // const DBPort = 5432;
        // const host = "localhost";
        const app = express();
        const router = express.Router();
        const server = app.listen(serverPort);
        const dataBase = new DatabaseManager_1.DatabaseManager(username, password, database, DBPort, host);
        const authService = new AuthService_1.AuthService(dataBase);
        const socketHandler = new SocketHandler_1.SocketHandler(server, dataBase);
        const api = new RestApi_1.RestApi(dataBase, authService, socketHandler);
        // Apply middle wear
        app.use(bodyParser.json());
        app.use('/', router.get('/', (req, res) => res.send('Welcome to the Instant Messaging API')));
        app.use('/api', api.handleRoutes(router));
    }
}
exports.App = App;
//# sourceMappingURL=App.js.map