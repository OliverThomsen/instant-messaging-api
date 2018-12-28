import { DatabaseManager } from './DatabaseManager';
import { AuthService } from './AuthService';
import { SocketHandler } from './SocketHandler';
import { Router } from 'express';
import { AuthenticationError } from './errors/AuthenticationError';
import { UserExistError } from "./errors/UserExistError";


export class RestApi {

	private database: DatabaseManager;
	private authService: AuthService;
	private socketHandler: SocketHandler;

	constructor(database: DatabaseManager, authService: AuthService, socketHandler: SocketHandler) {
		this.database = database;
		this.authService = authService;
		this.socketHandler = socketHandler;
	}


	public handleRoutes(router: Router): Router {
		router.post('/login', async (req, res) => {
			try {
                if (! req.body.username ||req.body.username.length === 0) {
                	await res.status(400).json({error: 'Username is required'});
                } else {
                    const id = await this.authService.authenticate(req.body.username);
                    await res.json({id});
                }
			} catch(error) {
				await this.handleError(error, res);
			}
		});

		router.get('/users', async (req, res) => {
            try {
                const username = req.query ? req.query.username : '';
				const users = await this.database.searchUsers(username);
				await res.json(users)
			} catch(error) {
				await this.handleError(error, res);
			}
		});
		
		router.post('/users', async (req, res) => {
			console.log(req.body);
			try {
				if (! req.body.username ) {
					await res.status(400).json({error: 'Username is required'});
				} else if (req.body.username.length < 3) {
                    await res.status(400).json({error: 'Username must be more than 3 characters'});
                } else {
                    const user = await this.database.createUser(req.body.username);
                    await res.json(user);
                }
			} catch(error) {
				await this.handleError(error, res);
			}
			
		});

		router.get('/users/:id/chats', async (req, res) => {
			try {
                const chats = await this.database.getUserChats(parseInt(req.params.id));
                await res.json(chats);	
			} catch(error) {
				await this.handleError(error, res);
			}
		});

		router.post('/chats', async (req, res) => {
			try {
				const chat = await this.database.createChat(req.body.usernames, req.body.userID);
				this.socketHandler.subscribeUsersToChat(chat, req.body.usernames);
				await res.json(chat);
			} catch(error) {
				await this.handleError(error, res);
			}
		});

		router.get('/chats/:id/messages', async (req, res) => {
			try {
                const messages = await this.database.getChatMessages(req.params.id);
                await res.json(messages);	
			} catch(error) {
				await this.handleError(error, res);
			}
		});

		return router;
	}


	private async handleError(error, res): Promise<void> {
		if (error instanceof AuthenticationError || error  instanceof UserExistError) {
			await res.status(400).json({error: error.message});
		} else {
			console.log(error.message);
			await res.status(500).json({error: 'Sorry something went wrong'});
		}
	}
}
