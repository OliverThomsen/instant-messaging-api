import { createConnection } from "typeorm";
import { Message } from "./entity/Message";
import { Room } from "./entity/Room";
import { User } from "./entity/User";
import { UserRoom } from "./entity/UserRoom";

export class DataBase {

	private connection;

	constructor() {

		this.connect()
			.then((connection) => this.onConnection(connection))
			.catch(this.onConnectionError);
	}


	private connect() {
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


	public getUserID(username: string): Promise<number> {
		return this.connection
			.getRepository(User)
			.createQueryBuilder('user')
			.where('user.username = :name', {name: username})
			.getOne()
			.then(user => {
				if (user) {
					return user.id;
				} else {
					return -1;
				}
			});
	}


	public createUser(username: string): Promise<User> {
		const user = new User(username);

		return this.connection.manager.save(user);
	}
}
