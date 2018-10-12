import * as express from 'express';
import { SocketHandler } from "./SocketHandler";
import { RestApi } from "./RestApi";
import { DataBase } from "./DataBase";


export class App {

	constructor (port: number) {
		const server = express().listen(port);
		const dataBase = new DataBase();
		new SocketHandler(server);
		new RestApi(express.Router());

	}
}