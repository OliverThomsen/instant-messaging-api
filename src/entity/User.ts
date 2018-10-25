import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Message } from "./Message";
import { UserRoom } from "./UserRoom";


@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', {name: 'user_name'})
	userName: string;

	@OneToMany(type => Message, message => message.user)
	message: Message[];

	@OneToMany(type => UserRoom, userRoom => userRoom.user)
	userRoom: UserRoom[];

	constructor(userName: string) {
		this.userName = userName;
	}

}