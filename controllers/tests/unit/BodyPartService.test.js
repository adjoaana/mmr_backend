const BodyPartService = require('../../services/BodyPart.service');
const db = require('../db');

let service = null;
beforeAll(async () => await db.connect());
beforeEach(async () => {
	await db.clear();
	service = new BodyPartService();
});
afterAll(async () => {
	const response = await db.close()
	return response;
});

describe('Test BodyPartService methods', () => {
	test("create bodyPart create method", async () => {
		const new_bodyPart = { name: "head", description: "head testing" }

		const bodyPart = await service.create(new_bodyPart);

		expect(bodyPart.name).toMatch(new_bodyPart.name);
		expect(bodyPart.description).toMatch(new_bodyPart.description);
	});
});