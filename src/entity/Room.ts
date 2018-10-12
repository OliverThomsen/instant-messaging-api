import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Message } from "./Message";


@Entity()
export class Room {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@OneToMany(type => Message, message => message.room)
	message: Message[];

}