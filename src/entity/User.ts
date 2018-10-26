import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Message } from "./Message";
import { UserRoom } from "./UserRoom";


@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar')
	username: string;

	@OneToMany(type => Message, message => message.user)
	message: Message[];

	@OneToMany(type => UserRoom, userRoom => userRoom.user)
	userRoom: UserRoom[];

	constructor(username: string) {
		this.username = username;
	}

}