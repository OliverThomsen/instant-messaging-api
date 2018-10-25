import { createConnection } from "typeorm";
import { Message } from "./entity/Message";
import { Room } from "./entity/Room";
import { User } from "./entity/User";
import { UserRoom } from "./entity/UserRoom";

export class DataBase {

	private connection;

	constructor() {

		this.createConnection()
			.then((connection) => this.onConnection(connection))
			.catch(this.onConnectionError);
	}


	private createConnection() {
		return createConnection({
			type: "mysql",
			host: "localhost",
			port: 3306,
			username: "root",
			password: "password",
			database: "instant_messaging",
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


	private onConnection(connection) {
		this.connection = connection;
	}


	private onConnectionError(error) {
		console.log(error);
	}


	public createUser(userName: string): Promise<User> {
		const user = new User(userName);

		return this.connection.manager.save(user);
	}
}
