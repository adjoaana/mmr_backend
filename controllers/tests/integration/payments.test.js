const request = require('supertest');
const app = require('../../app');
const AuthenticationManager = require('../../utils/Authentication.manager');
const db = require('../db');

require("dotenv").config();
const env = require("../../config");
const agent = request.agent(app);

const AdminService = require('../../services/Admin.service');
const UserService = require('../../services/User.service');
const PaymentService = require('../../services/Payment.service');

let adminService = null;
let paymentService = null;
let userService = null;
let patient = null;
let patientToken = null;
let adminToken = null;

beforeAll(async () => {
	await db.connect();
});
afterAll(async () => {
	const response = await db.close()
	return response;
});
beforeEach(async () => {
	await db.clear();
	adminService = new AdminService();
	paymentService = new PaymentService()
	userService = new UserService();

	const newAdmin = { email: "admin@email.com", name: "tester one", photo: { key: "photo-key" }, password: "default_password" };
	const newPatient = { email: "test@email.com", name: "tester one", photo: { key: "photo-key" }, password: "default_password", role: env.PATIENT_ROLE };

	admin = await adminService.create(newAdmin);
	patient = await userService.create(newPatient);

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

	adminToken = AuthenticationManager.createToken(adminbody);
	patientToken = AuthenticationManager.createToken(patientbody);
});

describe('Payments CRUD endpoint tests', () => {
	test('Test GET / ', async () => {
		const expectedCount = 5;
		const new_payment = {
			user: patient._id,
			paymentRef: "002525555",
			amount: 100,
			currency: "GH#"
		}
		for (let i = 0; i < expectedCount; i++) {
			new_payment.paymentRef = `002525555${i}`;
			new_payment.amount = i * 100;
			await paymentService.create(new_payment);
		}
		return agent.get('/api/payments')
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.length).toBe(expectedCount);
				for (let i = 0; i < expectedCount; i++) {
					expect(res.body.body[i].user._id.toString()).toMatch(patient._id.toString());
					expect(res.body.body[i].user.name).toMatch(patient.name);
					expect(res.body.body[i].user.email).toMatch(patient.email);
					expect(res.body.body[i].paymentRef).toMatch(`002525555${i}`);
					expect(res.body.body[i].amount).toBe(i * 100);
					expect(res.body.body[i].currency).toMatch(new_payment.currency);
				}
			});
	});

	test('Test GET /paginate', async () => {
		const new_payment = {
			user: patient._id,
			paymentRef: "002525555",
			amount: 100,
			currency: "GH#"
		}

		const expectedCount = 50;
		const payments = [];
		for (let i = 0; i < expectedCount; i++) {
			new_payment.paymentRef = `002525555${i}`;
			new_payment.amount = i * 100;
			payments.push(await paymentService.create(new_payment));
		}
		const limit = 15;
		const lastPageCount = 5;
		let j = 0;
		for (let page = 0; page < expectedCount / limit; page++) {
			return agent.get(`/api/payments/paginate?page=${page}&limit=${limit}`)
				.set('Accept', 'application/json')
				.set('Auth-Token', adminToken)
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
						expect(res.body.body[i]._id).toMatch(payments[j++]._id.toString());
					}
				});
		}
	});

	test('Test GET /:id ', async () => {
		const new_payment = {
			user: patient._id,
			paymentRef: "002525555",
			amount: 100,
			currency: "GH#"
		}
		const payment = await paymentService.create(new_payment);
		return agent.get(`/api/payments/${payment._id.toString()}`)
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.user._id.toString()).toMatch(patient._id.toString());
				expect(res.body.body.user.name).toMatch(patient.name);
				expect(res.body.body.user.email).toMatch(patient.email);
				expect(res.body.body.paymentRef).toMatch(payment.paymentRef);
				expect(res.body.body.amount).toBe(payment.amount);
				expect(res.body.body.currency).toMatch(payment.currency);
			});
	});

	test('Test POST / ', async () => {
		const new_payment = {
			user: patient._id,
			paymentRef: "002525555",
			amount: 100,
			currency: "GH#"
		}
		return agent.post('/api/payments/')
			.send(new_payment)
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.expect(201)
			.then(res => {
				expect(res.body.body.user.toString()).toMatch(patient._id.toString());
				expect(res.body.body.paymentRef).toMatch(new_payment.paymentRef);
				expect(res.body.body.amount).toBe(new_payment.amount);
				expect(res.body.body.currency).toMatch(new_payment.currency);
			});
	});

	test('Test POST / with incomplete request body', async () => {
		const new_payment = {
			user: patient._id,
			paymentRef: "002525555",
			amount: 100,
			currency: "GH#"
		}

		const keys = Object.keys(new_payment);
		for (let i = 0; i < keys.length; i++) {
			const bad_request = Object.assign({}, new_payment);
			delete bad_request[keys[i]];
			return agent.post('/api/payments/')
				.send(bad_request)
				.set('Auth-Token', adminToken)
				.set('Accept', 'application/json')
				.expect(400)
		}
	});

	test('Test PUT / ', async () => {
		const new_payment = {
			user: patient._id,
			paymentRef: "002525555",
			amount: 100,
			currency: "GH#"
		}
		const payment = await paymentService.create(new_payment);
		const updated_payment = {
			user: patient._id,
			paymentRef: "00252",
			amount: 150,
			currency: "NGN#"
		}
		return agent.put(`/api/payments/${payment._id.toString()}`)
			.set('Auth-Token', adminToken)
			.send(updated_payment)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.user.toString()).toMatch(patient._id.toString());
				expect(res.body.body.paymentRef).toMatch(updated_payment.paymentRef);
				expect(res.body.body.amount).toBe(updated_payment.amount);
				expect(res.body.body.currency).toMatch(updated_payment.currency);
			});
	});

	test('Test PUT / with incomplete request body', async () => {
		const new_payment = {
			user: patient._id,
			paymentRef: "002525555",
			amount: 100,
			currency: "GH#"
		}
		const payment = await paymentService.create(new_payment);
		const updated_payment = {
			user: patient._id,
			paymentRef: "00252",
			amount: 150,
			currency: "NGN#"
		}
		const keys = Object.keys(updated_payment);
		for (let i = 0; i < keys.length; i++) {
			const bad_request = Object.assign({}, updated_payment);
			delete bad_request[keys[i]];
			return agent.put(`/api/payments/${payment._id.toString()}`)
				.send(bad_request)
				.set('Auth-Token', adminToken)
				.set('Accept', 'application/json')
				.expect(400);
		}
	});

	test('Test DELETE /:id (soft delete)', async () => {
		const new_payment = {
			user: patient._id,
			paymentRef: "002525555",
			amount: 100,
			currency: "GH#"
		}
		const payment = await paymentService.create(new_payment);

		return agent.delete(`/api/payments/${payment._id.toString()}`)
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.user.toString()).toMatch(payment.user.toString());
				expect(res.body.body.paymentRef).toMatch(payment.paymentRef);
				expect(res.body.body.amount).toBe(payment.amount);
				expect(res.body.body.currency).toMatch(payment.currency);
				expect(res.body.body.deleted.status).toBeTruthy();
			});
	});

});
