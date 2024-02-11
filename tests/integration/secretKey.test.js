const env = require("../../config");
const fs = require('fs');
const jwa = require('jwa');
const path = require("path");

const privateKeyPath = env.PEM_PATH;
const publicKeyPath = env.PUB_PATH;

describe('Verify ES512 key files', () => {
	test("Check existence of private key", () => {
		expect(fs.existsSync(path.join(__dirname, "/../../keys/", privateKeyPath))).toBeTruthy();
	});

	test("Check existence of public key", () => {
		expect(fs.existsSync(path.join(__dirname, "/../../keys/", publicKeyPath))).toBeTruthy();
	});

	test("Verify keys", () => {
		const privateKey = fs.readFileSync(path.join(__dirname, "/../../keys/", privateKeyPath));
		const publicKey = fs.readFileSync(path.join(__dirname, "/../../keys/", publicKeyPath));
		const ecdsa = jwa('ES512');
		const input = 'very important stuff';

		const signature = ecdsa.sign(input, privateKey);
		expect(ecdsa.verify(input, signature, publicKey)).toBeTruthy();
	});
})


