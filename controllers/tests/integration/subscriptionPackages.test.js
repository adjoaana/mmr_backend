const request = require('supertest');
const app = require('../../app');
const AuthenticationManager = require('../../utils/Authentication.manager');
const db = require('../db');

require("dotenv").config();
const env = require("../../config");
const agent = request.agent(app);

const AdminService = require('../../services/Admin.service');
const SubscriptionPackageService = require('../../services/SubscriptionPackage.service');
const UserService = require('../../services/User.service');

let userService = null;
let adminService = null;
let subscriptionPackageService = null;

beforeAll(async () => {await db.connect()});
afterAll(async () => {
	const response = await db.close()
	return response;
});
beforeEach(async () => {
	await db.clear();
	adminService = new AdminService();
	subscriptionPackageService = new SubscriptionPackageService()
	userService = new UserService();
	
	const new_patient = { email: "test@email.com", name: "tester one", photo: { key: "photo-key" }, password: "default_password", role: env.PATIENT_ROLE };
	const new_admin = { email: "admin@email.com", name: "tester one", photo: { key: "photo-key" }, password: "default_password" };

	admin = await adminService.create(new_admin);
	patient = await userService.create(new_patient);

	const adminbody = {
		email: admin.email,
		_id: admin._id,
		role: env.ADMIN_ROLE,
	}

	const patientbody = {
		email: patient.email,
		_id: patient._id,
		role: env.PATIENT_ROLE,
		creator: patient.creator,
	}

	patient_token = AuthenticationManager.createToken(patientbody);
	admin_token = AuthenticationManager.createToken(adminbody);
});

describe('SubscriptionPackages CRUD endpoint tests', () => {
	test('Test GET / ', async () => {
		const expectedCount = 5;
		const new_package = {
			title: "Test package",
			description: "This is a test package",
			userType: env.HEALTH_PROFESSIONAL_ROLE, 
			price: 100,
			duration: 14,
			duration_text: "two weeks",
			currency:"GH#"
		}
		for (let i = 0; i < expectedCount; i++) {
			new_package.title = `Test ${i}`;
			new_package.description = `This is test ${i}`;
			new_package.price = i * 100;
			new_package.duration = i * 10;
			await subscriptionPackageService.create(new_package);
		}
		return agent.get('/api/subscriptionPackages')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.length).toBe(expectedCount);
				for (let i = 0; i < expectedCount; i++) {
					expect(res.body.body[i].title).toMatch(`Test ${i}`);
					expect(res.body.body[i].description).toMatch(`This is test ${i}`);
					expect(res.body.body[i].price).toBe(i * 100);
					expect(res.body.body[i].duration).toBe(i * 10);
					expect(res.body.body[i].currency).toMatch(new_package.currency);
				}
			});
	});

	test('Test GET /paginate', async () => {
		const new_package = {
			title: "Test package",
			description: "This is a test package",
			userType: env.HEALTH_FACILITY_ROLE, 
			price: 100,
			duration: 14,
			duration_text: "two weeks",
			currency: "GH#"
		}

		const expectedCount = 50;
		const packages = [];
		for (let i = 0; i < expectedCount; i++) {
			new_package.title = `Test ${i}`;
			new_package.description = `This is test ${i}`;
			new_package.price = i * 100;
			new_package.duration = i * 10;
			packages.push(await subscriptionPackageService.create(new_package));
		}
		const limit = 15;
		const lastPageCount = 5;
		let j = 0;
		for (let page = 0; page < expectedCount / limit; page++) {
			return agent.get(`/api/subscriptionPackages/paginate?page=${page}&limit=${limit}`)
				.set('Accept', 'application/json')
				.set('Auth-Token', admin_token)
				.set('Accept', 'application/json')
				.expect(200)
				.then(res => {
					if (page > 2) {
						expect(res.body.body.length).toBe(lastPageCount);
					}
					else {
						expect(res.body.body.length).toBe(limit);
					}

					const end = page > 2 ? 5 : limit;

					for (let i = 0; i < end; i++) {
						expect(res.body.body[i]._id).toMatch(packages[j++]._id.toString());
					}
				});
		}
	});

	test('Test GET /:id ', async () => {
		const new_package = {
			title: "Test package",
			description: "This is a test package",
			userType: env.ORG_ROLE, 
			price: 100,
			duration: 14,
			duration_text: "two weeks",
			currency: "GH#"
		}
		const sub_package = await subscriptionPackageService.create(new_package);
		return agent.get(`/api/subscriptionPackages/${sub_package._id.toString()}`)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.title).toMatch(sub_package.title);
				expect(res.body.body.description).toMatch(sub_package.description);
				expect(res.body.body.price).toBe(sub_package.price);
				expect(res.body.body.duration).toBe(sub_package.duration);
				expect(res.body.body.currency).toMatch(sub_package.currency);
			});
	});

	test('Test POST / ', async () => {
		const new_package = {
			title: "Test package",
			description: "This is a test package",
			userType: env.HEALTH_PROFESSIONAL_ROLE, 
			price: 100,
			duration: 14,
			duration_text: "two weeks",
			currency: "GH#"
		}
		const expectedDefault = {
			disabled: false,
		}
		return agent.post('/api/subscriptionPackages/')
			.send(new_package)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(201)
			.then(res => {
				expect(res.body.body.title).toBe(new_package.title);
				expect(res.body.body.description).toBe(new_package.description);
				expect(res.body.body.price).toBe(new_package.price);
				expect(res.body.body.duration).toBe(new_package.duration);
				expect(res.body.body.disabled).toBe(expectedDefault.disabled);
				expect(res.body.body.duration_text).toBe(new_package.duration_text);
				expect(res.body.body.currency).toBe(new_package.currency);
			});
	});

	test('Test POST / with incomplete request body', () => {
		const new_package = {
			title: "Test package",
			description: "This is a test package",
			userType: env.HEALTH_PROFESSIONAL_ROLE, 
			price: 100,
			duration: 14,
			duration_text: "two weeks",
			currency: "GH#"
		}
		
		const keys = Object.keys(new_package);
		for (let i = 0; i < keys.length; i++) {
			const bad_request = Object.assign({}, new_package);
			delete bad_request[keys[i]];
			return agent.post('/api/subscriptionPackages/')
				.send(bad_request)
				.set('Auth-Token', admin_token)
				.set('Accept', 'application/json')
				.expect(400)
		}
	});

	test('Test PUT / ', async () => {
		const new_package = {
			title: "Test package",
			description: "This is a test package",
			userType: env.HEALTH_PROFESSIONAL_ROLE, 
			price: 100,
			duration: 14,
			duration_text: "two weeks",
			currency: "GH#"
		}
		const sub_package = await subscriptionPackageService.create(new_package);
		const updated_sub_package = {
			title: "Test",
			description: "This is a test",
			price: 1050,
			duration: 104,
			userType: env.PATIENT_ROLE, 
			disabled: true,
			duration_text: "Three weeks",
			currency: "NGN"
		}
		return agent.put(`/api/subscriptionPackages/${sub_package._id.toString()}`)
			.set('Auth-Token', admin_token)
			.send(updated_sub_package)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.title).toMatch(updated_sub_package.title);
				expect(res.body.body.description).toMatch(updated_sub_package.description);
				expect(res.body.body.duration_text).toMatch(updated_sub_package.duration_text);
				expect(res.body.body.userType).toMatch(updated_sub_package.userType);
				expect(res.body.body.disabled).toBeTruthy();
				expect(res.body.body.price).toBe(updated_sub_package.price);
				expect(res.body.body.duration).toBe(updated_sub_package.duration);
				expect(res.body.body.currency).toMatch(updated_sub_package.currency);
			});
	});

	test('Test PUT / with incomplete request body', async () => {
		const new_package = {
			title: "Test package",
			description: "This is a test package",
			userType: env.HEALTH_PROFESSIONAL_ROLE, 
			price: 100,
			duration: 14,
			duration_text: "two weeks",
			currency: "GH#"
		}
		const sub_package = await subscriptionPackageService.create(new_package);
		const updated_sub_package = {
			title: "Test",
			description: "This is a test",
			price: 1050,
			duration: 104,
			duration_text: "Three weeks",
			currency:  "NGN"
		}
		const keys = Object.keys(updated_sub_package);
		for (let i = 0; i < keys.length; i++) {
			const bad_request = Object.assign({}, updated_sub_package);
			delete bad_request[keys[i]];
			return agent.put(`/api/subscriptionPackages/${sub_package._id.toString()}`)
				.send(bad_request)
				.set('Auth-Token', admin_token)
				.set('Accept', 'application/json')
				.expect(400)
		}
	});

	test('Test DELETE /:id (soft delete)', async () => {
		const new_package = {
			title: "Test package",
			description: "This is a test package",
			userType: env.HEALTH_PROFESSIONAL_ROLE, 
			price: 100,
			duration: 14,
			duration_text: "two weeks",
			currency: "GH#"
		}
		const sub_package = await subscriptionPackageService.create(new_package);

		return agent.delete(`/api/subscriptionPackages/${sub_package._id.toString()}`)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.title).toMatch(sub_package.title);
				expect(res.body.body.description).toMatch(sub_package.description);
				expect(res.body.body.duration_text).toMatch(sub_package.duration_text);
				expect(res.body.body.deleted.status).toBeTruthy();
				expect(res.body.body.price).toBe(sub_package.price);
				expect(res.body.body.duration).toBe(sub_package.duration);
				expect(res.body.body.currency).toMatch(sub_package.currency);
			});
	});

	test('Test GET /currentOfferings ', async () => {
		const expectedCount = 5;
		const new_package = {
			title: "Test package",
			description: "This is a test package",
			userType: env.PATIENT_ROLE, 
			price: 100,
			duration: 14,
			disabled: true,
			duration_text: "two weeks",
			currency: "GH#"
		}
		for (let i = expectedCount; i < expectedCount * 2; i++) {
			new_package.title = `Test ${i}`;
			new_package.description = `This is test ${i}`;
			new_package.price = i * 100;
			new_package.duration = i * 10;
			await subscriptionPackageService.create(new_package);
		}

		new_package.disabled = false;
		for (let i = 0; i < expectedCount; i++) {
			new_package.title = `Test ${i}`;
			new_package.description = `This is test ${i}`;
			new_package.price = i * 100;
			new_package.duration = i * 10;
			await subscriptionPackageService.create(new_package);
		}

		return agent.get('/api/subscriptionPackages/current_offerings')
			.set('Auth-Token', patient_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.length).toBe(expectedCount);
				for (let i = 0; i < expectedCount; i++) {
					expect(res.body.body[i].title).toMatch(`Test ${i}`);
					expect(res.body.body[i].description).toMatch(`This is test ${i}`);
					expect(res.body.body[i].price).toBe(i * 100);
					expect(res.body.body[i].duration).toBe(i * 10);
					expect(res.body.body[i].currency).toMatch(new_package.currency);
				}
			});
	});

});
