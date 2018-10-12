export class RestApi {
	private router;

	constructor(router) {
		this.router = router;

		router.post('/user', (req, res) => {

		});

		router.get('/user/:id', () => {

		});

		router.get('/user/:id/rooms', () => {

		});

		router.get('/user/:id/rooms/:id/messages', () => {

		});

		router.post('/users', () => {

		});

		router.post('/rooms', () => {

		});


	}
}