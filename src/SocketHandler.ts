import * as io from 'socket.io';
import { Server } from 'net';


export class SocketHandler {
	private io;
	private userSockets = {};

	constructor(server: Server) {
		this.io = io(server, {serveClient: false});
		this.io.on('connection', socket => this.handleSocket(socket))
	}


	handleSocket(socket): void {
		console.log('New socket connection established - id: ', socket.id);


		const rooms = [socket.handshake.query.rooms];

		socket.join(rooms, (err) => {
			if (err) throw err;

			console.log(rooms)
		});



		socket.on('chat', (data) => {
			console.log(data);
			this.io.to(data.chat).emit('chat', data)
			// Todo: save messages in db
		});

		socket.on('typing', (data) => {
			console.log(data);
			socket.broadcast.to(data.chat).emit('typing', data.user)
		})
	}
}