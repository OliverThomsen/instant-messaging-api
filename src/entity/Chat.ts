import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { Message } from "./Message";
import { UserChat } from "./UserChat";


@Entity()
export class Chat {

	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { nullable: true })
	name: string;

	@OneToOne(type => Message, { nullable: true })
	@JoinColumn({ name: 'last_message'})
	lastMessage: Message;

	@OneToMany(type => Message, message => message.chat)
	messages: Message[];

	@OneToMany(type => UserChat, userChat => userChat.chat)
	users: UserChat[];

}