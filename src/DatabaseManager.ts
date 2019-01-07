import { createConnection, Connection, EntityManager, getRepository, DeleteResult } from 'typeorm';
import { Message } from './entity/Message';
import { Chat } from './entity/Chat';
import { User } from './entity/User';
import { UserChat } from './entity/UserChat';
import { UserExistError } from "./errors/UserExistError";


export class DatabaseManager {

	private username: string;
	private password: string;
	private database: string;
	private port: number;
	private host: string;

	private connection: Connection;
	private manager: EntityManager;

	constructor(username: string, password: string, database: string, port: number, host: string) {
		this.username = username;
		this.password = password;
		this.database = database;
		this.port = port;
		this.host = host;

		this.connect()
			.then((connection) => {
				this.connection = connection;
				this.manager = this.connection.manager;
			})
			.catch(error => console.log(error));
	}


	private connect(): Promise<Connection> {
		return createConnection({
			type: "postgres",
			host: this.host,
			port: this.port,
			username: this.username,
			password: this.password,
			database: this.database,
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
			throw new UserExistError(`User with username: \"${username}\" already exists`);
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


	public async createMessage(chatID: number, userID: number, content: string): Promise<Message|null> {
		const user = await getRepository(User).findOne(userID);
		const chat = await getRepository(Chat).findOne(chatID);

		// Check if user has access to chat
		const userChat = await getRepository(UserChat)
			.createQueryBuilder('userChat')
			.where('userChat.user_id = :userID', {userID: user.id})
			.andWhere('userChat.chat_id = :chatID', {chatID: chat.id})
			.getRawOne();

		if (userChat) {
			const message = new Message(content, user, chat);
			return await this.manager.save(message);
		} else {
			return null;
		}
	}


	public async getUser(userID: number): Promise<User> {
		return getRepository(User).findOne(userID);
	}

	public async getChat(chatID: number): Promise<Chat> {
		return getRepository(Chat).findOne(chatID);

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

		return Promise.all(chatsWithLastMessage).then(chats => {
			chats.sort((a, b) => {
				const dateA = a.lastMessage ? new Date(a.lastMessage.timeStamp).getTime() : 0;
				const dateB = b.lastMessage ? new Date(b.lastMessage.timeStamp).getTime() : 0;
				return dateA - dateB;
			});
			chats.reverse();

			return chats;
		});
	}


	public async getUserChatIDs(userID: number): Promise<number[]> {
		const rawChatIDs = await getRepository(UserChat)
			.createQueryBuilder('')
			.select('chat_id')
			.where('user_id = :id', {id: userID})
			.getRawMany();

		return rawChatIDs.map(rawID => rawID.chat_id);
	}


	public async getChatMessages(chatID: number): Promise<Message[]> {
		return getRepository(Message)
			.createQueryBuilder('message')
			.leftJoinAndSelect('message.user', 'user')
			.where('chat_id = :id', {id: chatID})
			.orderBy('message.time_stamp', 'ASC')
			.getMany();
	}


	public async getLastMessage(chatID: number): Promise<Message> {
		return getRepository(Message)
			.createQueryBuilder('message')
			.leftJoinAndSelect('message.user', 'user')
			.where('message.chat_id =:id', {id: chatID})
			.orderBy('message.time_stamp', 'DESC')
			.getOne();
	}


	public async deleteUser(id: number): Promise<DeleteResult> {
		await getRepository(Message)
			.createQueryBuilder()
			.delete()
			.where('user_id = :id', {id})
			.execute();

		await getRepository(UserChat)
			.createQueryBuilder()
			.delete()
			.where('user_id = :id', {id})
			.execute();

		return getRepository(User)
			.createQueryBuilder()
			.delete()
			.where('id = :id', {id})
			.execute();
	}


	public async deleteChat(id: number): Promise<DeleteResult> {
		await getRepository(Message)
			.createQueryBuilder()
			.delete()
			.where('chat_id = :id', {id})
			.execute();

		await getRepository(UserChat)
			.createQueryBuilder()
			.delete()
			.where('chat_id = :id', {id})
			.execute();

		return getRepository(Chat)
			.createQueryBuilder()
			.delete()
			.where('id = :id', {id})
			.execute();
	}



	public async getChatInCommon(userIDs: number[]): Promise<Chat|null> {
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
}
