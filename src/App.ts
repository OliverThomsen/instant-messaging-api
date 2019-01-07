import * as express from 'express';
import * as bodyParser from 'body-parser';
import { SocketHandler } from './SocketHandler';
import { RestApi } from './RestApi';
import { DatabaseManager } from './DatabaseManager';
import { AuthService } from './AuthService';


export class App {

	constructor (serverPort: number) {

		// Production
		// const username = "xsqrwfcwrvmsff";
		// const password = "6d67098f8f3c47c7c0b9ee1bbfb7f5e14e08643108473f1f7e8615e38040b789";
		// const database = "d687fmprvdip4p";
		// const DBPort = 5432;
		// const host = "ec2-54-227-249-201.compute-1.amazonaws.com";

		// Localhost
		const username = "postgres";
		const password = "password";
		const database = "instant_messaging_test";
		const DBPort = 5432;
		const host = "localhost";

		const app = express();
		const router = express.Router();
		const server = app.listen(serverPort);

		const dataBase = new DatabaseManager(username, password, database, DBPort, host);
		const authService = new AuthService(dataBase);
		const socketHandler = new SocketHandler(server, dataBase);
		const api = new RestApi(dataBase, authService, socketHandler);

		// Apply middle wear
		app.use(bodyParser.json());
		app.use('/', router.get('/', (req, res) => res.send('Welcome to the Instant Messaging API')));
		app.use('/api', api.handleRoutes(router));
	}
}