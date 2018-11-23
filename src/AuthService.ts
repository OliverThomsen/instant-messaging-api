import { DataBase } from './DataBase';


export class AuthService {

	private database;

	constructor(database: DataBase) {
		this.database = database;
	}

	public async login(username: string): Promise<number> {
		const id = await this.database.getUserID(username);
		if (id === -1) throw new Error(`Unable to authenticate user with username: ${username}`);

		return id;
	}
}
