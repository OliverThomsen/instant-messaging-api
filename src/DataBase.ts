import { createConnection, Connection, EntityManager, getRepository } from 'typeorm';
import { Message } from './entity/Message';
import { Chat } from './entity/Chat';
import { User } from './entity/User';
import { UserChat } from './entity/UserChat';
import { accessSync } from 'fs';


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
			const users = await this.getUsers(userIDs);
			const chat = await this.getChatInCommon(userIDs);

			if (chat) return chat;

			const newChat = await this.manager.save(new Chat());
			for (const user of users) {
				const userRoom = new UserChat(user, newChat);
				this.connection.manager.save(userRoom);
			}

			return newChat;
	}


	public async createMessage(chatID: number, userID: number, content: string): Promise<Message> {
		const user = await getRepository(User).findOne(userID);
		const chat = await getRepository(Chat).findOne(chatID);
		const message = await this.manager.save(new Message(content, user, chat));

		chat.lastMessage = message;

		this.manager.save(chat);

		return message;
	}


	public async getUserID(username: string): Promise<number> {
		const user = await getRepository(User)
			.createQueryBuilder('user')
			.where('user.username = :name', {name: username})
			.getOne();

		if (! user) return -1;

		return user.id;
	}


	public async getUserChats(userID: number): Promise<Chat[]> {
		const rawChatIDs = await getRepository(UserChat)
			.createQueryBuilder('userChat')
			.select('userChat.chat_id')
			.where('userChat.user_id = :id', {id : userID})
			.getRawMany();

		const chatIDs = rawChatIDs.map(idObject => idObject.chat_id);

		return getRepository(Chat).findByIds(chatIDs, {relations: ['lastMessage', 'users', 'users.user']});
	}


	public async getUserChatIDs(userID): Promise<number[]> {
		const rawChatIDs = await getRepository(UserChat)
			.createQueryBuilder('')
			.select('chat_id')
			.where('user_id = :id', {id: userID})
			.getRawMany();

		return rawChatIDs.map(rawID => rawID.chat_id);
	}


	public async getChatMessages(chatID): Promise<Message[]> {
		return getRepository(Message)
			.createQueryBuilder()
			.where('chat_id = :id', {id: chatID})
			.getMany();
	}


	private async getChatInCommon(userIDs: number[]): Promise<Chat> {
		const chatID = await this.connection
			.createQueryBuilder()
			.select('userChat.chat_id')
			.from(UserChat, 'userChat')
			.groupBy('userChat.chat_id')
			.having('SUM(user_id IN (:...users)) = COUNT(*)', {users: userIDs})
			.andHaving('COUNT(*) = :num', {num: userIDs.length})
			.getRawOne();

		return getRepository(Chat).findOne(chatID);
	}


	private async getUsers(userIDs): Promise<User[]> {
		const users = [];
		for (const userID of userIDs) {
			const user = await getRepository(User).findOne(userID);
			if (user) users.push(user);
			else throw new Error('User with id: ' + userID + ' does not exist');
		}

		return users;
	}


	private onConnection(connection): void {
		this.connection = connection;
		this.manager = this.connection.manager;
	}


	private onConnectionError(error): void {
		console.log(error);
	}
}
