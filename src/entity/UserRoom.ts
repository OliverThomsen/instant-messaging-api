import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, PrimaryColumn } from "typeorm";
import { Message } from "./Message";
import { User } from "./User";
import { Room } from "./Room";


@Entity()
export class UserRoom {

	@Column()
	messageLastReceived: Message;

	@Column()
	messageLastSeen: Message;

	@PrimaryColumn()
	@ManyToOne(type => User)
	user: User;

	@PrimaryColumn()
	@ManyToOne(type => Room)
	room: Room;

}