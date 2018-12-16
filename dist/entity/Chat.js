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
const UserChat_1 = require("./UserChat");
let Chat = class Chat {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Chat.prototype, "id", void 0);
__decorate([
    typeorm_1.Column('varchar', { nullable: true }),
    __metadata("design:type", String)
], Chat.prototype, "name", void 0);
__decorate([
    typeorm_1.OneToMany(type => Message_1.Message, message => message.chat),
    __metadata("design:type", Array)
], Chat.prototype, "messages", void 0);
__decorate([
    typeorm_1.OneToMany(type => UserChat_1.UserChat, userChat => userChat.chat),
    __metadata("design:type", Array)
], Chat.prototype, "users", void 0);
Chat = __decorate([
    typeorm_1.Entity()
], Chat);
exports.Chat = Chat;
//# sourceMappingURL=Chat.js.map