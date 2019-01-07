import { describe, it } from 'mocha'
import { expect, assert } from 'chai'
import { DatabaseManager} from "../src/DatabaseManager";

const username = "postgres";
const password = "password";
const database = "instant_messaging_test";
const DBPort = 5432;
const host = "localhost";


describe('DatabaseManager', async () => {

	const db = new DatabaseManager(username, password, database, DBPort, host);

	let alice;
	let bob;
	let chat;

	describe('createUser()', () => {
		it('should save user to the database', async () => {
			alice = await db.createUser('Alice');
			bob = await db.createUser('Bob');
			const aliceFromDB = await db.getUser(alice.id);
			const bobFromDB = await db.getUser(bob.id);

			expect(aliceFromDB.id).to.equal(alice.id);
			expect(bobFromDB.id).to.equal(bob.id);
		});
	});


	describe('commonChatRoom()', () => {
		it('should return null when there is no common chat', async () => {
			const result = await db.getChatInCommon([alice.id, bob.id]);

			expect(result).to.equal(null);
		});
	});


	describe('createChat()', () => {
		it('should save the chat in the database', async () => {
			chat = await db.createChat([alice.username], bob.id);
			const chatFromDB = await db.getChat(chat.id);

			expect(chat.id).to.equal(chatFromDB.id);
		});
	});


	describe('commonChatRoom()', () => {
		it('should return the Chat object that the users have in common', async () => {
			const commonChat = await db.getChatInCommon([alice.id, bob.id]);
			const usernames = commonChat.users.map((userChat) => userChat.user.username);
			const numberOfUsers = usernames.length;

			expect(commonChat).to.be.an('object');
			expect(usernames).to.include(alice.username);
			expect(usernames).to.include(bob.username);
			expect(numberOfUsers).to.equal(2);
		})
	});


	// Clean up
	await db.deleteChat(chat.id);
	await db.deleteUser(alice.id);
	await db.deleteUser(bob.id);
});
