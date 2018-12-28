"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserExistError extends Error {
    constructor(message) {
        super(message);
        this.name = "UserExistError";
    }
}
exports.UserExistError = UserExistError;
//# sourceMappingURL=UserExistError.js.map