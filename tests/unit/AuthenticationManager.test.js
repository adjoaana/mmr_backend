const { readFileSync } = require('node:fs');
const jwt = require("jsonwebtoken");
const env = require("../../config");

const AuthenticationManager = require('../../utils/Authentication.manager');
const publicKey = readFileSync(`${__dirname}/../../keys/${env.PUB_PATH}`);
const privateKey = readFileSync(`${__dirname}/../../keys/${env.PEM_PATH}`);
describe('unit tests for AuthenticationManager', () => {
	test('test createToken', () => {
		const body = {
			email: "test@email.com",
			role: "ind"
		}
		const token = AuthenticationManager.createToken(body);
		const payload = jwt.verify(token, publicKey);
		expect(payload.email).toMatch(body.email);
		expect(payload.role).toMatch(body.role);
	});

	test('test verifyToken with valid token', () => {
		const body = {
			email: "test@email.com",
			role: "ind"
		}
		const token = jwt.sign({
			...body,
		}, privateKey, {
			algorithm: "ES512",
			expiresIn: 10000
		});

		const payload = AuthenticationManager.decodeToken(token);
		expect(payload.email).toMatch(body.email);
		expect(payload.role).toMatch(body.role);
	});

	test('test verifyToken with invalid token', () => {
		const body = {
			email: "test@email.com",
			role: "ind"
		}
		const token = jwt.sign({
			...body,
		}, privateKey, {
			algorithm: "ES512",
			expiresIn: -10000
		});

		const payload = AuthenticationManager.decodeToken(token);
		expect(payload.email).toBeUndefined();
		expect(payload.role).toBeUndefined();
	});

	test('test validity of expired token with expired token', () => {
		const body = {
			email: "test@email.com",
			role: "ind"
		}
		// Test is token has expired.
		const token1 = jwt.sign({
			...body,
		}, privateKey, {
			algorithm: "ES512",
			expiresIn: -100
		});
		const payload1 = AuthenticationManager.isTokenValid(token1);
		expect(payload1).toBeFalsy();

	});

	test('test validity token created before now', () => {
		const body = {
			email: "test@email.com",
			role: "ind"
		}
		// Testing creation is after now.
		const token1 = jwt.sign({
			...body,
			iat: Math.floor(Date.now() / 1000) + 1000,
		}, privateKey, {
			algorithm: "ES512",
			expiresIn: 1000
		});
		const payload1 = AuthenticationManager.isTokenValid(token1);
		expect(payload1).toBeFalsy();

		// Testing creation is before now.
		const token2 = jwt.sign({
			...body,
			iat: Math.floor(Date.now() / 1000) - 200,
		}, privateKey, {
			algorithm: "ES512",
			expiresIn: 1000
		});

		const payload2 = AuthenticationManager.isTokenValid(token2);
		expect(payload2).toBeTruthy();
	});

	test('test validity of valid token', () => {
		const body = {
			email: "test@email.com",
			role: "ind"
		}
		// Testing valid token within the right time bounds.
		const token3 = jwt.sign({
			...body,
		}, privateKey, {
			algorithm: "ES512",
			expiresIn: 100
		});
		const payload3 = AuthenticationManager.isTokenValid(token3);
		expect(payload3).toBeTruthy();
	});
});
