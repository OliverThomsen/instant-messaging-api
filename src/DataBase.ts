import { createConnection } from "typeorm";
import { Message } from "./entity/Message";
import { Room } from "./entity/Room";
import { User } from "./entity/User";
import { UserRoom } from "./entity/UserRoom";

export class DataBase {

	constructor() {
		this.createConnection()
			.then(this.onConnection)
			.catch(this.onConnectionError);
	}

	private createConnection() {
		return createConnection({
			type: "mysql",
			host: "localhost",
			port: 3306,
			username: "root",
			password: "admin",
			database: "test",
			entities: [
				Message,
				Room,
				User,
				UserRoom
			],
			synchronize: true,
			logging: false
		})
	}

	private onConnection() {

	}

	private onConnectionError(error) {
		console.log(error);
	}
}
