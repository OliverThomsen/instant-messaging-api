"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Message_1 = require("./entity/Message");
const Chat_1 = require("./entity/Chat");
const User_1 = require("./entity/User");
const UserChat_1 = require("./entity/UserChat");
class DataBase {
    constructor() {
        this.connect()
            .then((connection) => this.onConnection(connection))
            .catch(this.onConnectionError);
    }
    connect() {
        return typeorm_1.createConnection({
            type: "postgres",
            host: "ec2-54-227-249-201.compute-1.amazonaws.com",
            port: 5432,
            username: "xsqrwfcwrvmsff",
            password: "6d67098f8f3c47c7c0b9ee1bbfb7f5e14e08643108473f1f7e8615e38040b789",
            database: "d687fmprvdip4p",
            entities: [
                Message_1.Message,
                Chat_1.Chat,
                User_1.User,
                UserChat_1.UserChat
            ],
            synchronize: false,
            logging: false
        });
    }
    createUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((yield this.getUserID(username)) !== -1) {
                throw new Error(`User with username \"${username}\" already exists`);
            }
            return this.manager.save(new User_1.User(username));
        });
    }
    createChat(usernames, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUser(userID);
            usernames.push(user.username);
            usernames = [...new Set(usernames.map(username => username.toLowerCase()))];
            const users = yield this.getUsersByUsername(usernames);
            const chat = yield this.getChatInCommon(users.map(user => user.id));
            if (chat) {
                return this.applyDefaultChatName(chat, userID);
            }
            const newChat = yield this.manager.save(new Chat_1.Chat());
            for (const user of users) {
                const userChat = new UserChat_1.UserChat(user, newChat);
                yield this.connection.manager.save(userChat);
            }
            const chatWithUsers = yield typeorm_1.getRepository(Chat_1.Chat).findOne(newChat.id, { relations: ['users', 'users.user'] });
            return this.applyDefaultChatName(chatWithUsers, userID);
        });
    }
    createMessage(chatID, userID, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield typeorm_1.getRepository(User_1.User).findOne(userID);
            const chat = yield typeorm_1.getRepository(Chat_1.Chat).findOne(chatID); // Todo: check if user exists in this chat
            const message = new Message_1.Message(content, user, chat);
            return yield this.manager.save(message);
        });
    }
    getUser(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            return typeorm_1.getRepository(User_1.User).findOne(userID);
        });
    }
    searchUsers(username) {
        return __awaiter(this, void 0, void 0, function* () {
            username = username ? username : '';
            return yield typeorm_1.getRepository(User_1.User)
                .createQueryBuilder()
                .where('LOWER(username) LIKE LOWER(:name)', { name: `%${username}%` })
                .printSql()
                .getMany();
        });
    }
    getUserID(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield typeorm_1.getRepository(User_1.User)
                .createQueryBuilder('user')
                .where('user.username = :name', { name: username })
                .getOne();
            if (!user)
                return -1;
            return user.id;
        });
    }
    getUserChats(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawChatIDs = yield typeorm_1.getRepository(UserChat_1.UserChat)
                .createQueryBuilder('userChat')
                .select('userChat.chat_id')
                .where('userChat.user_id = :id', { id: userID })
                .getRawMany();
            const chatIDs = rawChatIDs.map(idObject => idObject.chat_id);
            const chats = yield typeorm_1.getRepository(Chat_1.Chat).findByIds(chatIDs, { relations: ['users', 'users.user'] });
            const chatsWithLastMessage = chats.map((chat) => __awaiter(this, void 0, void 0, function* () {
                chat.lastMessage = yield this.getLastMessage(chat.id);
                return this.applyDefaultChatName(chat, userID);
            }));
            return yield Promise.all(chatsWithLastMessage);
        });
    }
    getUserChatIDs(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawChatIDs = yield typeorm_1.getRepository(UserChat_1.UserChat)
                .createQueryBuilder('')
                .select('chat_id')
                .where('user_id = :id', { id: userID })
                .getRawMany();
            return rawChatIDs.map(rawID => rawID.chat_id);
        });
    }
    getChatMessages(chatID) {
        return __awaiter(this, void 0, void 0, function* () {
            return typeorm_1.getRepository(Message_1.Message)
                .createQueryBuilder('message')
                .leftJoinAndSelect('message.user', 'user')
                .where('chat_id = :id', { id: chatID })
                .getMany();
        });
    }
    getLastMessage(chatID) {
        return typeorm_1.getRepository(Message_1.Message)
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.user', 'user')
            .where('message.chat_id =:id', { id: chatID })
            .orderBy('message.time_stamp', 'DESC')
            .getOne();
    }
    getChatInCommon(userIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawChatID = yield typeorm_1.getRepository(UserChat_1.UserChat)
                .createQueryBuilder()
                .select('chat_id')
                .groupBy('chat_id')
                .having('SUM(user_id IN (:...users)::int) = COUNT(*)', { users: userIDs })
                .andHaving('COUNT(*) = :num', { num: userIDs.length })
                .getRawOne();
            return rawChatID ? typeorm_1.getRepository(Chat_1.Chat).findOne(rawChatID.chat_id, { relations: ['users', 'users.user'] }) : null;
        });
    }
    getUsers(userIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = [];
            for (const userID of userIDs) {
                const user = yield typeorm_1.getRepository(User_1.User).findOne(userID);
                if (user)
                    users.push(user);
                else
                    throw new Error('User with id: ' + userID + ' does not exist');
            }
            return users;
        });
    }
    getUsersByUsername(usernames) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = [];
            for (const username of usernames) {
                const user = yield typeorm_1.getRepository(User_1.User)
                    .createQueryBuilder()
                    .where('LOWER(username) LIKE LOWER(:name)', { name: `%${username}%` })
                    .getOne();
                if (user)
                    users.push(user);
                else
                    throw new Error('User with username: ' + username + ' does not exist');
            }
            return users;
        });
    }
    applyDefaultChatName(chat, userID) {
        if (chat.name)
            return chat;
        if (chat.users.length === 1) {
            chat.name = chat.users[0].user.username;
        }
        else {
            chat.name = chat.users.reduce((nameAccumulator, userChat) => {
                if (userChat.user.id === userID)
                    return nameAccumulator;
                if (nameAccumulator.length === 0)
                    return userChat.user.username;
                return `${nameAccumulator}, ${userChat.user.username}`;
            }, '');
        }
        return chat;
    }
    onConnection(connection) {
        this.connection = connection;
        this.manager = this.connection.manager;
    }
    onConnectionError(error) {
        console.log(error);
    }
}
exports.DataBase = DataBase;
//# sourceMappingURL=DataBase.js.map