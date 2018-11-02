import { DataBase } from './DataBase';
import { AuthService } from './AuthService';


export class RestApi {

	private database: DataBase;
	private authService: AuthService;

	constructor(database: DataBase, authService: AuthService) {
		this.database = database;
		this.authService = authService;
	}


	public handleRoutes(router) {
		router.get('/', (req, res) => {
			res.send('hello');
		});


		router.post('/login', async (req, res) => {
			const id = await this.authService.login(req.body.username)
				.catch(error =>	res.send(error.message));
			res.send({id});
		});


		router.post('/users', async (req, res) => {
			const user = await this.database.createUser(req.body.username)
				.catch(err => res.send(err.message));
			res.send(user)
		});


		router.post('/chats', async (req, res) => {
			const room = await this.database.createChat(req.body.users);

			res.json(room);
		});

		router.get('/chats/:id', async (req, res) => {
			const chats = await this.database.getChats(req.params.id);

			res.json(chats);
		});

		return router;
	}
}