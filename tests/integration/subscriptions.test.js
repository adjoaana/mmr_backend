const request = require('supertest');
const app = require('../../app');
const AuthenticationManager = require('../../utils/Authentication.manager');
const db = require('../db');

require("dotenv").config();
const env = require("../../config");
const agent = request.agent(app);

const AdminService = require('../../services/Admin.service');
const SubscriptionService = require('../../services/Subscription.service');
const SubscriptionPackage = require('../../services/SubscriptionPackage.service');
const UserService = require('../../services/User.service');
const PaymentService = require('../../services/Payment.service');

let userService = null;
let adminService = null;
let subscriptionService = null;
let subscriptionPackageService = null;
let paymentService = null;

beforeAll(async () => { await db.connect(); });
afterAll(async () => {
	const response = await db.close()
	return response;
});
beforeEach(async () => {
	await db.clear();
	adminService = new AdminService();
	subscriptionService = new SubscriptionService();
	subscriptionPackageService = new SubscriptionPackage();
	userService = new UserService();
	paymentService = new PaymentService();

	const new_patient = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "default_password", role: env.PATIENT_ROLE };
	const new_admin = { email: "admin@email.com", photo: { key: "photo-key" }, name: "tester one", password: "default_password" };
	const new_package = {
		title: "Test package",
		description: "This is a test package",
		price: 100,
		userType: env.PATIENT_ROLE,
		duration: 14,
		duration_text: "two weeks",
		currency: "GH#"
	}
	admin = await adminService.create(new_admin);
	patient = await userService.create(new_patient);
	sub_package = await subscriptionPackageService.create(new_package);

	new_payment = { user: patient._id, paymentRef: "002525555", amount: 100, currency: "GH#" }
	payment = await paymentService.create(new_payment);


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

describe('Subscriptions CRUD endpoint tests', () => {
	test('Test GET / ', async () => {
		const now_time = Date.now();
		const expectedCount = 5;
		const new_subscription = {
			package: sub_package._id,
			user: patient._id,
			payment: payment._id,
			startTimestamp: now_time,
			endTimestamp: now_time + 100000,
		}
		for (let i = expectedCount - 1; i >= 0; i--) {
			new_subscription.startTimestamp = now_time + i * 20;
			new_subscription.endTimestamp = now_time + i * 500;
			new_payment.paymentRef = `002525555${i}`;
			payment = await paymentService.create(new_payment);
			new_subscription.payment = payment._id,
				await subscriptionService.create(new_subscription);
		}
		return agent.get('/api/subscriptions')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.length).toBe(expectedCount);
				for (let i = 0; i < expectedCount; i++) {
					expect(res.body.body[i].user._id.toString()).toMatch(patient._id.toString());
					expect(res.body.body[i].user.name).toMatch(patient.name);
					expect(res.body.body[i].user.email).toMatch(patient.email);
					expect(res.body.body[i].package._id.toString()).toMatch(sub_package._id.toString());
					expect(res.body.body[i].package.title).toBe(sub_package.title);
					expect(res.body.body[i].package.description).toMatch(sub_package.description);
					expect(res.body.body[i].payment._id.toString()).not.toBeUndefined();
					expect(res.body.body[i].payment.user).not.toBeUndefined();
					expect(res.body.body[i].payment.amount).not.toBeUndefined();
					expect(res.body.body[i].startTimestamp).toBe(now_time + i * 20);
					expect(res.body.body[i].endTimestamp).toBe(now_time + i * 500);
				}
			});
	});

	test('Test GET /paginate', async () => {
		const now_time = Date.now();
		const new_subscription = {
			package: sub_package._id,
			user: patient._id,
			payment: payment._id,
			startTimestamp: now_time,
			endTimestamp: now_time + 100000,
		}

		const expectedCount = 45;
		const subscriptions = [];
		for (let i = 0; i < expectedCount; i++) {
			new_subscription.startTimestamp = now_time + i * 20;
			new_subscription.endTimestamp = now_time + i * 500;
			new_payment.paymentRef = `002525555-${i}`;
			payment = await paymentService.create(new_payment);
			new_subscription.payment = payment._id;
			subscriptions.push(await subscriptionService.create(new_subscription));
		}
		const limit = 15;
		for (let page = expectedCount / limit - 1; page >= 0; page--) {
			return agent.get(`/api/subscriptions/paginate?page=${page}&limit=${limit}`)
				.set('Accept', 'application/json')
				.set('Auth-Token', admin_token)
				.set('Accept', 'application/json')
				.expect(200)
				.then(res => {
					expect(res.body.body.length).toBe(limit);
				});
		}
	});

	test('Test GET /:id ', async () => {
		const now_time = Date.now();
		const new_subscription = {
			package: sub_package._id,
			user: patient._id,
			payment: payment._id,
			startTimestamp: now_time,
			endTimestamp: now_time + 100000,
		}
		const subscription = await subscriptionService.create(new_subscription);
		return agent.get(`/api/subscriptions/${subscription._id.toString()}`)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.user._id.toString()).toMatch(patient._id.toString());
				expect(res.body.body.user.name).toMatch(patient.name);
				expect(res.body.body.user.email).toMatch(patient.email);
				expect(res.body.body.package._id.toString()).toMatch(sub_package._id.toString());
				expect(res.body.body.package.title).toMatch(sub_package.title);
				expect(res.body.body.package.description).toMatch(sub_package.description);
				expect(res.body.body.payment._id.toString()).toMatch(payment._id.toString());
				expect(res.body.body.payment.user).toMatch(payment.user.toString());
				expect(res.body.body.payment.amount).toBe(payment.amount);
				expect(res.body.body.startTimestamp).toBe(subscription.startTimestamp);
				expect(res.body.body.endTimestamp).toBe(subscription.endTimestamp);
			});
	});

	test('Test POST / ', async () => {
		const now_time = Date.now();
		const new_subscription = {
			package: sub_package._id,
			user: patient._id,
			payment: payment._id,
			startTimestamp: now_time,
			endTimestamp: now_time + 100000,
		}
		return agent.post('/api/subscriptions/')
			.send(new_subscription)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(201)
			.then(res => {
				expect(res.body.body.user.toString()).toMatch(patient._id.toString());
				expect(res.body.body.package.toString()).toMatch(sub_package._id.toString());
				expect(res.body.body.payment.toString()).toMatch(payment._id.toString());
				expect(res.body.body.startTimestamp).toBe(new_subscription.startTimestamp);
				expect(res.body.body.endTimestamp).toBe(new_subscription.endTimestamp);
			});
	});

	test('Test POST / with incomplete request body', async () => {
		const now_time = Date.now();
		const new_subscription = {
			package: sub_package._id,
			user: patient._id,
			payment: payment._id,
			startTimestamp: now_time,
			endTimestamp: now_time + 100000,
		}

		const keys = Object.keys(new_subscription);
		for (let i = 0; i < keys.length; i++) {
			if (keys[i] === "payment") {
				continue;
			}
			const bad_request = Object.assign({}, new_subscription);
			delete bad_request[keys[i]];
			return agent.post('/api/subscriptions/')
				.send(bad_request)
				.set('Auth-Token', admin_token)
				.set('Accept', 'application/json')
				.expect(400)
		}
	});

	test('Test PUT / ', async () => {
		const now_time = Date.now();
		const new_subscription = {
			package: sub_package._id,
			user: patient._id,
			payment: payment._id,
			startTimestamp: now_time,
			endTimestamp: now_time + 100000,
		}
		const subscription = await subscriptionService.create(new_subscription);
		const updated_subscription = {
			package: sub_package._id,
			user: patient._id,
			payment: payment._id,
			startTimestamp: now_time + 500,
			endTimestamp: now_time + 1000,
		}
		return agent.put(`/api/subscriptions/${subscription._id.toString()}`)
			.set('Auth-Token', admin_token)
			.send(updated_subscription)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.user.toString()).toMatch(patient._id.toString());
				expect(res.body.body.package.toString()).toMatch(sub_package._id.toString());
				expect(res.body.body.payment.toString()).toMatch(payment._id.toString());
				expect(res.body.body.startTimestamp).toBe(updated_subscription.startTimestamp);
				expect(res.body.body.endTimestamp).toBe(updated_subscription.endTimestamp);
			});
	});

	test('Test PUT / with incomplete request body', async () => {
		const now_time = Date.now();
		const new_subscription = {
			package: sub_package._id,
			user: patient._id,
			payment: payment._id,
			startTimestamp: now_time,
			endTimestamp: now_time + 100000,
		}
		const subscription = await subscriptionService.create(new_subscription);
		const updated_subscription = {
			package: sub_package._id,
			user: patient._id,
			payment: payment._id,
			startTimestamp: now_time + 500,
			endTimestamp: now_time + 1000,
		}
		const keys = Object.keys(updated_subscription);
		for (let i = 0; i < keys.length; i++) {
			if (keys[i] === "payment") {
				continue;
			}
			const bad_request = Object.assign({}, updated_subscription);
			delete bad_request[keys[i]];
			return agent.put(`/api/subscriptions/${subscription._id.toString()}`)
				.send(bad_request)
				.set('Auth-Token', admin_token)
				.set('Accept', 'application/json')
				.expect(400)
		}
	});

	test('Test DELETE /:id (soft delete)', async () => {
		const now_time = Date.now();
		const new_subscription = {
			package: sub_package._id,
			user: patient._id,
			payment: payment._id,
			startTimestamp: now_time,
			endTimestamp: now_time + 100000,
		}
		const subscription = await subscriptionService.create(new_subscription);

		return agent.delete(`/api/subscriptions/${subscription._id.toString()}`)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.user.toString()).toMatch(patient._id.toString());
				expect(res.body.body.package.toString()).toMatch(sub_package._id.toString());
				expect(res.body.body.payment.toString()).toMatch(payment._id.toString());
				expect(res.body.body.startTimestamp).toBe(subscription.startTimestamp);
				expect(res.body.body.endTimestamp).toBe(subscription.endTimestamp);
				expect(res.body.body.deleted.status).toBeTruthy();
			});
	});
});
