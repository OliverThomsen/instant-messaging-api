import * as express from 'express';
import * as bodyParser from 'body-parser';
import { SocketHandler } from "./SocketHandler";
import { RestApi } from "./RestApi";
import { DataBase } from "./DataBase";


export class App {

	constructor (port: number) {
		const app = express();
		const router = express.Router();
		const dataBase = new DataBase();
		const api = new RestApi(dataBase);


		// Apply middle wear
		app.use(bodyParser.json());
		app.use('/api', api.handleRoutes(router));


		// Listen to the server
		const server = app.listen(port);


		// Initiate web sockets
		new SocketHandler(server);

	}
}