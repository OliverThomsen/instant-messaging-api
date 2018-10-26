import { DataBase } from './DataBase';


export class AuthService {

	private database;

	constructor(database: DataBase) {
		this.database = database;
	}

	public login(username: string): number {
		return this.database.getUserID(username)
			.then(id => {
				if (id === -1) throw new Error(`Unable to authenticate user with username ${username}`);

				return id;
			});
	}
}