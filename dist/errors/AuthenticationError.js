"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthenticationError extends Error {
    constructor(message) {
        super(message);
        this.name = "AuthenticationError";
    }
}
exports.default = AuthenticationError;
//# sourceMappingURL=AuthenticationError.js.map