import { Entity, ManyToOne, JoinColumn } from "typeorm";
import { Message } from "./Message";
import { User } from "./User";
import { Room } from "./Room";


@Entity()
export class UserRoom {

	@ManyToOne(type => User, user => user.userRoom, { primary: true })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(type => Room, room => room.userRoom, { primary: true	})
	@JoinColumn({ name: 'room_id' })
	room: Room;

	@ManyToOne(type => Message, { nullable: true })
	@JoinColumn({ name: 'message_last_received'})
	messageLastReceived: Message;

	@ManyToOne(type => Message, { nullable: true })
	@JoinColumn({ name: 'message_last_seen' })
	messageLastSeen: Message;

	constructor(user: User, room: Room) {
		this.user = user;
		this.room = room;
	}

}