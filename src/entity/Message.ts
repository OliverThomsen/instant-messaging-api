import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { Room } from "./Room";


@Entity()
export class Message {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	content: string;

	@Column("Datetime")
	timeStamp: Date;

	@ManyToOne(type => User, user => user.message)
	user: User;

	@ManyToOne(type => Room, room => room.message)
	room: Room;

}