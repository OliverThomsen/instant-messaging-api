import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Message } from "./Message";
import { UserRoom } from "./UserRoom";
import { User } from "./User";


@Entity()
export class Room {

	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { nullable: true })
	name: string;

	@OneToMany(type => Message, message => message.room)
	message: Message[];

	@OneToMany(type => UserRoom, userRoom => userRoom.room)
	userRoom: UserRoom[];

}