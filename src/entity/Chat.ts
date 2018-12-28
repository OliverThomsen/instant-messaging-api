import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Message } from "./Message";
import { UserChat } from "./UserChat";


@Entity()
export class Chat {

	@PrimaryGeneratedColumn()
	public id: number;

	@Column('varchar', { nullable: true })
	public name: string;

	@OneToMany(type => Message, message => message.chat)
	public messages: Message[];

	@OneToMany(type => UserChat, userChat => userChat.chat)
	public users: UserChat[];

	public lastMessage: Message;
}