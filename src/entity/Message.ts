import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Room } from "./Room";


@Entity()
export class Message {

	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { length: 5000 })
	content: string;

	@CreateDateColumn({ name: 'time_stamp' })
	timeStamp: Date;

	@ManyToOne(type => User, user => user.message, { nullable: false })
	user: User;

	@ManyToOne(type => Room, room => room.message, { nullable: false })
	room: Room;

}