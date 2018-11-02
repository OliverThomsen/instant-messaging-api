import { createConnection, Connection, EntityManager, getRepository } from 'typeorm';
import { Message } from './entity/Message';
import { Chat } from './entity/Chat';
import { User } from './entity/User';
import { UserChat } from './entity/UserChat';

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
				Chat,
				User,
				UserChat
			],
			synchronize: true,
			logging: false
		})
	}


	public async createUser(username: string): Promise<User> {
		if (await this.getUserID(username) !== -1) {
			throw new Error(`User with username \"${username}\" already exists`);
		}

		return this.manager.save(new User(username));
	}


	public async createChat(userIDs: number[]): Promise<Chat> {
		const chatID = await this.getChatID(userIDs);

		if (chatID === -1) {
			const room = await this.manager.save(new Chat());

			userIDs.forEach(async (id) => {
				const user = await getRepository(User).findOne(id);
				const userRoom = new UserChat(user, room);

				this.connection.manager.save(userRoom)
					.catch(error => console.log(error));
			});

			return room;
		}

		return await getRepository(Chat).findOne(chatID);
	}


	public async getUserID(username: string): Promise<number> {

		const user = await getRepository(User)
			.createQueryBuilder('user')
			.where('user.username = :name', {name: username})
			.getOne();

		if (! user) return -1;

		return user.id;
	}


	private async getChatID(userIDs: number[]): Promise<number> {
		const chat = await this.connection
			.createQueryBuilder()
			.select('userChat.chat_id')
			.from(UserChat, 'userChat')
			.groupBy('userChat.chat_id')
			.having('SUM(user_id IN (:...users)) = COUNT(*)', {users: userIDs})
			.andHaving('COUNT(*) = :num', {num: userIDs.length})
			.getRawOne();

		return chat ? chat.chat_id : -1;
	}


	private onConnection(connection): void {
		this.connection = connection;
		this.manager = this.connection.manager;
	}


	private onConnectionError(error): void {
		console.log(error);
	}
}
