"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Message_1 = require("./Message");
const User_1 = require("./User");
const Chat_1 = require("./Chat");
let UserChat = class UserChat {
    constructor(user, chat) {
        this.user = user;
        this.chat = chat;
    }
};
__decorate([
    typeorm_1.ManyToOne(type => User_1.User, user => user.chats, { primary: true }),
    typeorm_1.JoinColumn({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], UserChat.prototype, "user", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Chat_1.Chat, room => room.users, { primary: true }),
    typeorm_1.JoinColumn({ name: 'chat_id' }),
    __metadata("design:type", Chat_1.Chat)
], UserChat.prototype, "chat", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Message_1.Message, { nullable: true }),
    typeorm_1.JoinColumn({ name: 'message_last_received' }),
    __metadata("design:type", Message_1.Message)
], UserChat.prototype, "messageLastReceived", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Message_1.Message, { nullable: true }),
    typeorm_1.JoinColumn({ name: 'message_last_seen' }),
    __metadata("design:type", Message_1.Message)
], UserChat.prototype, "messageLastSeen", void 0);
UserChat = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [User_1.User, Chat_1.Chat])
], UserChat);
exports.UserChat = UserChat;
//# sourceMappingURL=UserChat.js.map