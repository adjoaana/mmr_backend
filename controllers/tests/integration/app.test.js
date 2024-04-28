const request = require('supertest');
const app = require('../../app');
const db = require('../db');
require("dotenv").config();

const agent = request.agent(app);

beforeAll(async () => await db.connect());
beforeEach(async () => await db.clear());
afterAll(async () => {
	const response = await db.close()
	return response;
});

describe("app.js security tests", () => {
	it("tests not allowed request methods TRACE", async () => {
		expectedStatus = 405;
		return agent.trace('/api/')
			.send()
			.expect(expectedStatus)
	})

	it("tests not allowed request methods HEAD", async () => {
		expectedStatus = 405;
		return agent.head('/api/')
			.send()
			.expect(expectedStatus)
	})

	it("Health Check", async () => {
		expectedStatus = 200;
		return agent.get('/')
			.send()
			.expect(expectedStatus)
	})
})