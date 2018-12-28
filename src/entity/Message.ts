import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";
import { Chat } from "./Chat";


@Entity()
export class Message {

	@PrimaryGeneratedColumn()
	public id: number;

	@Column('varchar', { length: 5000 })
	public content: string;

	@CreateDateColumn({ name: 'time_stamp' })
	public timeStamp: Date;

	@ManyToOne(type => User, user => user.messages, { nullable: false })
	@JoinColumn({ name: 'user_id'})
	public user: User;

	@ManyToOne(type => Chat, chat => chat.messages, { nullable: false })
	@JoinColumn({ name: 'chat_id'})
	public chat: Chat;

	constructor(content: string, user: User, chat: Chat) {
		this.content = content;
		this.user = user;
		this.chat = chat;
	}

}