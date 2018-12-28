import * as io from 'socket.io';
import { Server } from 'net';
import { DatabaseManager } from './DatabaseManager';
import { Chat } from './entity/Chat';


export class SocketHandler {
	private io;
	private activeUserSockets: object = {};
	private database: DatabaseManager;

	constructor(server: Server, database: DatabaseManager) {
		this.io = io(server, {serveClient: false});
		this.io.on('connection', socket => this.handleSocket(socket));
		this.database = database;
	}


	private async handleSocket(socket): Promise<void> {
		console.log('New socket connection:', socket.id);
		const userID = socket.handshake.query.userID;
		const user = await this.database.getUser(userID);

		this.referenceSocketToUser(socket, userID);
		await this.subscribeSocketToChats(socket, userID);


		socket.on('message', async (data) => {
			const message = await this.database.createMessage(data.chatID, userID, data.content);
			if (message) {
				this.io.to(data.chatID).emit('message', message);
			}
		});

		socket.on('typing', (data) => {
			socket.broadcast.to(data.chatID).emit('typing', {username: user.username, chatID: data.chatID})
		});

		socket.on('disconnect', () => {
			const i = this.activeUserSockets[userID].indexOf(socket);
			this.activeUserSockets[userID].splice(i, 1);
			console.log('Socket disconnected:', socket.id);
		});
	}


	public async subscribeUsersToChat(chat: Chat, usersNames: string[]): Promise<void> {
		const userIDs = []

		for (let username of usersNames) {
			const id = await this.database.getUserID(username);
			userIDs.push(id);
		}


		userIDs.forEach(id => {
			if (this.activeUserSockets[id]) {
				this.activeUserSockets[id].forEach(socket => {
					socket.join(chat.id, (err) => {
						if (err) throw err;
					});
				});
			}
		});
	}


	private referenceSocketToUser(socket, userID: number): void {
		if (! this.activeUserSockets[userID]) {
			this.activeUserSockets[userID] = [];
		}

		this.activeUserSockets[userID].push(socket);
	}


	private async subscribeSocketToChats(socket, userID: number): Promise<void> {
		const chatIDs = await this.database.getUserChatIDs(userID);

		chatIDs.forEach((chatID) => {
			socket.join(chatID, (err) => {
				if (err) throw err;
			});
		});

	}
}
