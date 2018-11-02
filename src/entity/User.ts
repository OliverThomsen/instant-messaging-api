import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Message } from "./Message";
import { UserChat } from "./UserChat";


@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar')
	username: string;

	@OneToMany(type => Message, message => message.user)
	messages: Message[];

	@OneToMany(type => UserChat, userChat => userChat.user)
	chats: UserChat[];

	constructor(username: string) {
		this.username = username;
	}

}