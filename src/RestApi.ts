export class RestApi {

	private database;
	private authService;

	constructor(database, authService) {
		this.database = database;
		this.authService = authService;
	}


	public handleRoutes(router) {
		router.get('/', (req, res) => {
			console.log('base');
			res.send('hello');
		});


		router.post('/login', (req, res) => {
			console.log(req.body.username);
			this.authService.login(req.body.username)
				.then(id => res.send({id}))
				.catch(error =>	res.send(error.message));
		});


		router.post('/user', (req, res) => {
			this.database.createUser(req.body.username)
				.then(user => res.send(user))
				.catch(err => res.send(err));
		});

		return router;
	}
}