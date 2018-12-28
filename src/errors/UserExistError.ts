
export class UserExistError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UserExistError"
	}
}
