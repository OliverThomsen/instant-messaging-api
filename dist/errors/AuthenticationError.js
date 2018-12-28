"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthenticationError";
    }
}
exports.AuthenticationError = AuthenticationError;
//# sourceMappingURL=AuthenticationError.js.map