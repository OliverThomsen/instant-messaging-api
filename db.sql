drop database if exists instant_messaging;
create database	instant_messaging;
use instant_messaging;

create table users(
	id int unsigned not null auto_increment primary key,
    user_name varchar(30) not null
);

create table rooms(
	id int unsigned not null auto_increment primary key,
    name varchar(30) 
);

create table messages(
	id int unsigned not null auto_increment primary key,
    content varchar(300) not null,
    time_stamp datetime not null,
    user_id int unsigned not null,
    room_id int unsigned not null,
    foreign key (user_id) references users(id),
    foreign key (room_id) references rooms(id)
);
    
create table user_chat_room(
	user_id int unsigned not null,
	room_id int unsigned not null,
	last_received_message int unsigned,
	last_seen_message int unsigned,
	primary key (user_id, room_id),
	foreign key (user_id) references users(id),
	foreign key (room_id) references rooms(id)
);
      