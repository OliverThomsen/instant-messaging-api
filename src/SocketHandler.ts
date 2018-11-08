import * as io from 'socket.io';
import { Server } from 'net';
import { DataBase } from './DataBase';
import { Chat } from './entity/Chat';


export class SocketHandler {
	private io;
	private userSockets = {};
	private dataBase: DataBase;

	constructor(server: Server, dataBase: DataBase) {
		this.io = io(server, {serveClient: false});
		this.io.on('connection', socket => this.handleSocket(socket));
		this.dataBase = dataBase;
	}


	public handleSocket(socket): void {
		console.log('New socket connection established - id:', socket.id);
		const userID = socket.handshake.query.userID;

		this.attachSocketToUser(socket, userID);
		this.subscribeSocketToChats(socket, userID);

		socket.on('message', (data) => {
			this.io.to(data.chatID).emit('chat', data);
			this.dataBase.saveMessage(data.chatID, userID, data.content);
		});

		socket.on('typing', (data) => {
			socket.broadcast.to(data.chat).emit('typing', data.user)
		});

	}


	public subscribeUsersToChat(chat: Chat, usersIDs: number[]) {
		usersIDs.forEach(id => {
			if (this.userSockets[id]) {
				this.userSockets[id].forEach(socket => {
					socket.join(chat.id, (err) => {
						if (err) throw err;
					});
				});
			}
		});
	}


	private attachSocketToUser(socket, userID) {
		if (! this.userSockets[userID]) {
			this.userSockets[userID] = [];
		}

		this.userSockets[userID].push(socket);
	}


	private async subscribeSocketToChats(socket, userID) {
		const chatIDs = await this.dataBase.getChatIDs(userID);

		chatIDs.forEach((chatID) => {
			socket.join(chatID, (err) => {
				if (err) throw err;
			});
		});

	}
}