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
const User_1 = require("./User");
const Chat_1 = require("./Chat");
let Message = class Message {
    constructor(content, user, chat) {
        this.content = content;
        this.user = user;
        this.chat = chat;
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Message.prototype, "id", void 0);
__decorate([
    typeorm_1.Column('varchar', { length: 5000 }),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    typeorm_1.CreateDateColumn({ name: 'time_stamp' }),
    __metadata("design:type", Date)
], Message.prototype, "timeStamp", void 0);
__decorate([
    typeorm_1.ManyToOne(type => User_1.User, user => user.messages, { nullable: false }),
    typeorm_1.JoinColumn({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], Message.prototype, "user", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Chat_1.Chat, chat => chat.messages, { nullable: false }),
    typeorm_1.JoinColumn({ name: 'chat_id' }),
    __metadata("design:type", Chat_1.Chat)
], Message.prototype, "chat", void 0);
Message = __decorate([
    typeorm_1.Entity(),
    __metadata("design:paramtypes", [String, User_1.User, Chat_1.Chat])
], Message);
exports.Message = Message;
//# sourceMappingURL=Message.js.map