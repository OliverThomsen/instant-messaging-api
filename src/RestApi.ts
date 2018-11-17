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
			res.json({message: 'hello'});
		});

		router.post('/login', async (req, res) => {
			const id = await this.authService.login(req.body.username)
				.catch(error =>	res.send(error.message));
			res.json({id});
		});

		router.post('/users', async (req, res) => {
			if (req.body.username.length < 3) {
				console.log('error')
				res.status(400).json({error: 'Username must be more than 3 characters'})
			}
			const user = await this.database.createUser(req.body.username)
				.catch(err => res.send(err.message));
			res.json(user)
		});

		router.get('/users/:id/chats', async (req, res) => {
			const chats = await this.database.getUserChats(parseInt(req.params.id));
			res.json(chats);
		});

		router.post('/chats', async (req, res) => {
			try {
				const chat = await this.database.createChat(req.body.users, req.body.userID);
				this.socketHandler.subscribeUsersToChat(chat, req.body.users);
				res.json(chat);
			} catch(error) {
				res.json({error: error.message});
			}
		});

		router.get('/chats/:id/messages', async (req, res) => {
			const messages = await this.database.getChatMessages(req.params.id);
			res.json(messages);
		});

		return router;
	}
}