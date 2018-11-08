import { DataBase } from './DataBase';
import { AuthService } from './AuthService';
import { SocketHandler } from './SocketHandler';


export class RestApi {

	private database: DataBase;
	private authService: AuthService;
	private socketHandler: SocketHandler;

	constructor(database: DataBase, authService: AuthService, socketHandler: SocketHandler) {
		this.database = database;
		this.authService = authService;
		this.socketHandler = socketHandler;
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
			const chat = await this.database.createChat(req.body.users);
			this.socketHandler.subscribeUsersToChat(chat, req.body.users);

			res.json(chat);
		});

		router.get('/chats/:id', async (req, res) => {
			const chats = await this.database.getChats(req.params.id);

			res.json(chats);
		});

		router.get('/chats/:id/messages', async (req, res) => {
			const messages = await this.database.getMessages(req.params.id);

			res.json(messages);
		});

		return router;
	}
}