import { createConnection, Connection, EntityManager, getRepository} from 'typeorm';
import { Message } from './entity/Message';
import { Room } from './entity/Room';
import { User } from './entity/User';
import { UserRoom } from './entity/UserRoom';

export class DataBase {

	private connection: Connection;
	private manager: EntityManager;

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
		this.manager = this.connection.manager;
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

		return this.manager.save(user);
	}


	public async createRoom(userIDs: number[]): Promise<Room> {
		const commonRoom = await this.getCommonRoom(userIDs);

		if (! commonRoom) {
			const room = await this.manager.save(new Room());

			userIDs.forEach(async (id) => {
				const user = await getRepository(User).findOne(id);
				const userRoom = new UserRoom(user, room);

				this.connection.manager.save(userRoom)
					.catch(error => console.log(error));
			});

			return room;
		}

		return await this.connection.getRepository(Room).findOne(commonRoom.room_id);
	}


	private async getCommonRoom(userIDs: number[]) {
		return await this.connection
			.createQueryBuilder()
			.select('userRoom.room_id')
			.from(UserRoom, 'userRoom')
			.groupBy('userRoom.room_id')
			.having('SUM(user_id IN (:...users)) = COUNT(*)', {users: userIDs})
			.andHaving('COUNT(*) = :num', {num: userIDs.length})
			.getRawOne();
	}
}
