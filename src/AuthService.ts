import { DatabaseManager } from './DatabaseManager';
import { AuthenticationError } from "./errors/AuthenticationError";


export class AuthService {

	private database: DatabaseManager;

	constructor(database: DatabaseManager) {
		this.database = database;
	}

	public async authenticate(username: string): Promise<number> {
		const id = await this.database.getUserID(username);
		if (id === -1) throw new AuthenticationError(`Unable to authenticate user with username: ${username}`);

		return id;
	}
}
