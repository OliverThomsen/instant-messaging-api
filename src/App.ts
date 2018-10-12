import * as express from 'express';
import { SocketHandler } from "./SocketHandler";
import { RestApi } from "./RestApi";


export class App {

	constructor (port: number) {
		const server = express().listen(port);
		new SocketHandler(server);
		new RestApi(express.Router());
	}
}