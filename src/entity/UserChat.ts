import { Entity, ManyToOne, JoinColumn } from "typeorm";
import { Message } from "./Message";
import { User } from "./User";
import { Chat } from "./Chat";


@Entity()
export class UserChat {

	@ManyToOne(type => User, user => user.chats, { primary: true })
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(type => Chat, room => room.users, { primary: true	})
	@JoinColumn({ name: 'chat_id' })
	chat: Chat;

	@ManyToOne(type => Message, { nullable: true })
	@JoinColumn({ name: 'message_last_received'})
	messageLastReceived: Message;

	@ManyToOne(type => Message, { nullable: true })
	@JoinColumn({ name: 'message_last_seen' })
	messageLastSeen: Message;

	constructor(user: User, chat: Chat) {
		this.user = user;
		this.chat = chat;
	}

}