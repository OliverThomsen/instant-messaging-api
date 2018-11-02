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


	public async getChats(userID: number): Promise<Chat[]> {
		const rawChatIDs = await getRepository(UserChat)
			.createQueryBuilder('userChat')
			.select('userChat.chat_id')
			.where('userChat.user_id = :id', {id : userID})
			.getRawMany();

		const chatIDs = [];
		rawChatIDs.forEach(idObject => chatIDs.push(idObject.chat_id));

		return getRepository(Chat).findByIds(chatIDs, {relations: ['lastMessage', 'users', 'users.user']});
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


	public async saveMessage(chatId: number, userId: number, content: string): Promise<Message> {
		const user = await getRepository(User).findOne(userId);
		const chat = await getRepository(Chat).findOne(chatId);
		const message = await this.manager.save(new Message(content, user, chat));

		chat.lastMessage = message;

		this.manager.save(chat);

		return message;
	}


	private onConnection(connection): void {
		this.connection = connection;
		this.manager = this.connection.manager;
	}


	private onConnectionError(error): void {
		console.log(error);
	}
}
