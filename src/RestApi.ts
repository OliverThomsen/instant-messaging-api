export class RestApi {

	private database;

	constructor(database) {
		this.database = database;
	}


	public handleRoutes(router) {
		router.get('/', (req, res) => {
			console.log('base');
			res.send('hello');
		});


		router.post('/user', (req, res) => {
			this.database.createUser(req.body.username)
				.then(user => res.send(user))
				.catch(err => res.send(err));
		});
		
		return router;
	}
}