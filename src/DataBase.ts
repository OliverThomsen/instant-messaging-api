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
			type: "postgres",
			host: "ec2-54-227-249-201.compute-1.amazonaws.com",
			port: 5432,
			username: "xsqrwfcwrvmsff",
			password: "6d67098f8f3c47c7c0b9ee1bbfb7f5e14e08643108473f1f7e8615e38040b789",
			database: "d687fmprvdip4p",
			entities: [
				Message,
				Chat,
				User,
				UserChat
			],
			synchronize: false,
			logging: false
		})
	}


	public async createUser(username: string): Promise<User> {
		if (await this.getUserID(username) !== -1) {
			throw new Error(`User with username \"${username}\" already exists`);
		}

		return this.manager.save(new User(username));
	}


	public async createChat(usernames: string[], userID: number): Promise<Chat> {
		const user = await this.getUser(userID);
		usernames.push(user.username);
		usernames = [...new Set(usernames.map(username => username.toLowerCase()))];
		const users = await this.getUsersByUsername(usernames);
		const chat = await this.getChatInCommon(users.map(user => user.id));

		if (chat) {
			return this.applyDefaultChatName(chat, userID);
		}

		const newChat = await this.manager.save(new Chat());
		for (const user of users) {
			const userChat = new UserChat(user, newChat);
			await this.connection.manager.save(userChat);
		}
		const chatWithUsers = await getRepository(Chat).findOne(newChat.id, {relations: ['users', 'users.user']});

		return this.applyDefaultChatName(chatWithUsers, userID);
	}


	public async createMessage(chatID: number, userID: number, content: string): Promise<Message> {
		const user = await getRepository(User).findOne(userID);
		const chat = await getRepository(Chat).findOne(chatID); // Todo: check if user exists in this chat
		const message = new Message(content, user, chat);

		return await this.manager.save(message);
	}


	public async getUser(userID): Promise<User> {
		return getRepository(User).findOne(userID);
	}
	

    public async searchUsers(username: String): Promise<User[]> {
		username = username ? username : '';
		return await getRepository(User)
			.createQueryBuilder()
			.where('LOWER(username) LIKE LOWER(:name)', {name: `%${username}%`})
			.printSql()
			.getMany();
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
		const chats = await getRepository(Chat).findByIds(chatIDs, {relations: ['users', 'users.user']});
		const chatsWithLastMessage = chats.map(async chat => {
			chat.lastMessage = await this.getLastMessage(chat.id);

			return this.applyDefaultChatName(chat, userID);
		});

		return await Promise.all(chatsWithLastMessage);
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
			.createQueryBuilder('message')
			.leftJoinAndSelect('message.user', 'user')
			.where('chat_id = :id', {id: chatID})
			.getMany();
	}


	public getLastMessage(chatID: number): Promise<Message> {
		return getRepository(Message)
			.createQueryBuilder('message')
			.leftJoinAndSelect('message.user', 'user')
			.where('message.chat_id =:id', {id: chatID})
			.orderBy('message.time_stamp', 'DESC')
			.getOne();
	}


	private async getChatInCommon(userIDs: number[]): Promise<Chat|null> {
		const rawChatID = await getRepository(UserChat)
			.createQueryBuilder()
			.select('chat_id')
			.groupBy('chat_id')
			.having('SUM(user_id IN (:...users)::int) = COUNT(*)', {users: userIDs})
			.andHaving('COUNT(*) = :num', {num: userIDs.length})
			.getRawOne();

		return rawChatID ? getRepository(Chat).findOne(rawChatID.chat_id, {relations: ['users', 'users.user']}) : null;
	}


	private async getUsers(userIDs: number[]): Promise<User[]> {
		const users = [];
		for (const userID of userIDs) {
			const user = await getRepository(User).findOne(userID);
			if (user) users.push(user);
			else throw new Error('User with id: ' + userID + ' does not exist');
		}

		return users;
	}
	
	
	private async getUsersByUsername(usernames: string[]): Promise<User[]> {
        const users = [];
        for (const username of usernames) {
            const user = await getRepository(User)
	            .createQueryBuilder()
	            .where('LOWER(username) LIKE LOWER(:name)', {name: `%${username}%`})
	            .getOne();
            if (user) users.push(user);
            else throw new Error('User with username: ' + username + ' does not exist');
        }

        return users;
	}


	private applyDefaultChatName(chat: Chat, userID: number): Chat {
		if (chat.name) return chat;
		
		if (chat.users.length === 1) {
			chat.name = chat.users[0].user.username;
		} else {
            chat.name = chat.users.reduce((nameAccumulator: string, userChat: UserChat) => {
                if (userChat.user.id === userID) return nameAccumulator;
                if (nameAccumulator.length === 0) return userChat.user.username;

                return `${nameAccumulator}, ${userChat.user.username}`;
            }, '');
        }
		return chat;
	}


	private onConnection(connection): void {
		this.connection = connection;
		this.manager = this.connection.manager;
	}


	private onConnectionError(error): void {
		console.log(error);
	}
}
