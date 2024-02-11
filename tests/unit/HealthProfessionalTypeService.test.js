const HealthProfessionalTypeService = require('../../services/HealthProfessionalType.service');
const db = require('../db');

let service = null;
beforeAll(async () => await db.connect());
beforeEach(async () => {
	await db.clear();
	service = new HealthProfessionalTypeService();
});
afterAll(async () => {
	const response = await db.close()
	return response;
});

describe('Test HealthProfessionalTypeService methods', () => {
	test("create healthProfessionalType method", async () => {
		const new_healthProfessionalType = { name: "physio", description: "testing" }

		const healthProfessionalType = await service.create(new_healthProfessionalType);

		expect(healthProfessionalType.name).toMatch(new_healthProfessionalType.name);
		expect(healthProfessionalType.description).toMatch(new_healthProfessionalType.description);
	});
});