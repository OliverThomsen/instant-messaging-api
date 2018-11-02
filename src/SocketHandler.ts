import * as io from 'socket.io';
import { Server } from 'net';
import { DataBase } from './DataBase';


export class SocketHandler {
	private io;
	private userSockets = {};
	private dataBase: DataBase;

	constructor(server: Server, dataBase: DataBase) {
		this.io = io(server, {serveClient: false});
		this.io.on('connection', socket => this.handleSocket(socket));
		this.dataBase = dataBase;
	}


	handleSocket(socket): void {
		console.log('New socket connection established - id:', socket.id);
		const userID = socket.handshake.query.userID;


		socket.on('message', (data) => {
			this.io.to(data.chatID).emit('chat', data);
			this.dataBase.saveMessage(data.chatID, userID, data.content);
		});


		socket.on('typing', (data) => {
			console.log(data);
			socket.broadcast.to(data.chat).emit('typing', data.user)
		})
	}


	private joinChatRooms(socket, userId): void {
		// TODO: subscribe to rooms
		// socket.join(rooms, (err) => {
		// 	if (err) throw err;
		//
		// 	console.log(rooms)
		// });
	}
}