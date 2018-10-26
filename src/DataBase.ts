import { createConnection, Connection} from 'typeorm';
import { Message } from './entity/Message';
import { Room } from './entity/Room';
import { User } from './entity/User';
import { UserRoom } from './entity/UserRoom';

export class DataBase {

	private connection: Connection;

	constructor() {

		this.connect()
			.then((connection) => this.onConnection(connection))
			.catch(this.onConnectionError);
	}


	private connect(): Promise<Connection> {
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


	public async getUserID(username: string): Promise<number> {

		const user = await this.connection
			.getRepository(User)
			.createQueryBuilder('user')
			.where('user.username = :name', {name: username})
			.getOne();

		if (! user) return -1;

		return user.id;
	}


	public async createUser(username: string): Promise<User> {
		if (await this.getUserID(username) !== -1) {
			throw new Error(`User with username \"${username}\" already exists`);
		}

		const user = new User(username);

		return this.connection.manager.save(user);
	}
}
