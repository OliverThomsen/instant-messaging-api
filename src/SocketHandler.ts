import * as io from 'socket.io';
import { Server } from 'net';
import { DataBase } from './DataBase';
import { Chat } from './entity/Chat';


export class SocketHandler {
	private io;
	private activeUserSockets = {};
	private dataBase: DataBase;

	constructor(server: Server, dataBase: DataBase) {
		this.io = io(server, {serveClient: false});
		this.io.on('connection', socket => this.handleSocket(socket));
		this.dataBase = dataBase;
	}


	private async handleSocket(socket): Promise<any> {
		console.log('New socket connection:', socket.id);
		const userID = socket.handshake.query.userID;
		const user = await this.dataBase.getUser(userID);

		this.referenceSocketToUser(socket, userID);
		await this.subscribeSocketToChats(socket, userID);

		socket.on('message', async (data) => {
			const message = await this.dataBase.createMessage(data.chatID, userID, data.content);
			this.io.to(data.chatID).emit('message', message);
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


	public subscribeUsersToChat(chat: Chat, usersIDs: number[]) {
		usersIDs.forEach(id => {
			if (this.activeUserSockets[id]) {
				this.activeUserSockets[id].forEach(socket => {
					socket.join(chat.id, (err) => {
						if (err) throw err;
					});
				});
			}
		});
	}


	private referenceSocketToUser(socket, userID) {
		if (! this.activeUserSockets[userID]) {
			this.activeUserSockets[userID] = [];
		}

		this.activeUserSockets[userID].push(socket);
	}


	private async subscribeSocketToChats(socket, userID) {
		const chatIDs = await this.dataBase.getUserChatIDs(userID);

		chatIDs.forEach((chatID) => {
			socket.join(chatID, (err) => {
				if (err) throw err;
			});
		});

	}
}
