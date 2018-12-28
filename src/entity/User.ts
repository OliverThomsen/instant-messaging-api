import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Message } from "./Message";
import { UserChat } from "./UserChat";


@Entity()
export class User {

	@PrimaryGeneratedColumn()
	public id: number;

	@Column('varchar')
	public username: string;

	@OneToMany(type => Message, message => message.user)
	public messages: Message[];

	@OneToMany(type => UserChat, userChat => userChat.user)
	public chats: UserChat[];

	constructor(username: string) {
		this.username = username;
	}

}