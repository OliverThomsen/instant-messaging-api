import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Message } from "./Message";


@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	userName: string;

	@OneToMany(type => Message, message => message.user)
	message: Message[];

}