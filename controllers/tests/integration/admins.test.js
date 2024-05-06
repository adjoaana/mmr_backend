const request = require('supertest');
const app = require('../../app');
const AuthenticationManager = require('../../utils/Authentication.manager');
const db = require('../db');
require("dotenv").config();

const env = require("../../config");
const agent = request.agent(app);

const AdminService = require('../../services/Admin.service');

let adminService = null;
let admin = null;
let adminCred = null;
let adminToken = null;
const default_password = "my_Pass232"

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

	adminCred = { email: "admin@email.com", name: "tester one", photo: { key: "photo-key" }, password: default_password };

	admin = await adminService.create(adminCred);

	const adminbody = {
		email: admin.email,
		_id: admin._id,
		role: env.ADMIN_ROLE,
	}

	adminToken = AuthenticationManager.createToken(adminbody);
});

describe("Admin Login tests", () => {
	test("Login with correct details", async () => {
		const adminLogin = {
			email: adminCred.email,
			password: adminCred.password,
		};
		const expected = {
			status: 200,
			msg: "Login successful."
		}
		return agent.post('/api/admins/login')
			.send(adminLogin)
			.expect(200)
			.then(res => {
				expect(res.body.token).toBeDefined();
				expect(res.body.msg).toMatch(expected.msg);
				expect(res.body.status).toBe(expected.status);
				const payload = AuthenticationManager.decodeToken(res.body.token);
				expect(payload.email).toMatch(adminLogin.email);
			});
	})

	test("Login with wrong email", async () => {
		const adminLogin = {
			email: "test1@email.com",
			password: adminCred.password,
		};
		const expected = {
			status: 400,
			msg: "Wrong login details."
		}
		return agent.post('/api/admins/login')
			.send(adminLogin)
			.expect(expected.status)
			.then(res => {
				expect(res.body.msg).toMatch(expected.msg);
			});
	})

	test("Login with wrong password", async () => {
		const adminLogin = {
			email: adminCred.email,
			password: "adminCredpassword",
		};
		const expected = {
			status: 400,
			msg: "Wrong login details."
		}
		const res = await agent.post('/api/admins/login')
			.send(adminLogin)
			.expect(expected.status);
		expect(res.body.msg).toMatch(expected.msg);
	})
})

describe("Admin creation tests", () => {
	test("Create with correct details", async () => {
		const newUser = {
			email: "test@email.com",
			name: "tester one",
			gender: "M",
			password: "my_4Pass23",
		};
		return agent.post('/api/admins')
			.set('Accept', 'application/json')
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.send(newUser)
			.expect(201)
			.then(res => {
				expect(res.body.body.email).toMatch(newUser.email);
				expect(res.body.body.name).toMatch(newUser.name);
				expect(res.body.body.password).toBeUndefined();
			});
	})

	test("Create with wrong password length", async () => {
		const newUser = {
			email: "test@email.com",
			name: "tester one",
			gender: "M",
			password: "my_as",
		};

		// password word less than 6 characters.
		const expected = "password"
		return agent.post('/api/admins')
			.set('Accept', 'application/json')
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.send(newUser)
			.expect(400)
			.then(res => {
				expect(res.body.errors[0].param).toMatch(expected);
			});

	});
	test("Create with wrong email format [string]", async () => {
		const newUser = {
			email: "tess",
			gender: "M",
			name: "tester one",
			password: "my_assE333",
		};

		// wrong email format
		expected = "email"
		return agent.post('/api/admins')
			.set('Accept', 'application/json')
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.send(newUser)
			.expect(400)
			.then(res => {
				expect(res.body.errors[0].param).toMatch(expected);
			});
	});
	test("Create with wrong email format [string@string]", async () => {
		const newUser = {
			email: "s@s",
			gender: "M",
			name: "tester one",
			password: "my_assE333",
		};

		// wrong email format
		expected = "email"
		return agent.post('/api/admins')
			.set('Accept', 'application/json')
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.send(newUser)
			.expect(400)
			.then(res => {
				expect(res.body.errors[0].param).toMatch(expected);
			});
	});
	test("Create with wrong email format [string@string.number]", async () => {
		const newUser = {
			email: "s@s.1",
			gender: "M",
			name: "tester one",
			password: "my_assE333",
		};

		// wrong email format
		expected = "email"

		return agent.post('/api/admins')
			.set('Accept', 'application/json')
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.send(newUser)
			.expect(400)
			.then(res => {
				expect(res.body.errors[0].param).toMatch(expected);
			});
	});
	test("Create with wrong no gender", async () => {
		const newUser = {
			email: "tes@s.com",
			name: "tester one",
			password: "my_assD3443",
		};

		// wrong email format
		expected = "gender"
		return agent.post('/api/admins')
			.set('Accept', 'application/json')
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.send(newUser)
			.expect(400)
			.then(res => {
				expect(res.body.errors[0].param).toMatch(expected);
			});
	});
})

describe('Admin CRUD methods tests', () => {
	beforeEach(async () => {
		await db.clear();
	})
	test("Test GET /", async () => {
		const expectedCount = 5;
		const new_admin = { email: "test00@email.com", photo: { key: "photo-key" }, name: "tester one", password: default_password };
		let admin = null;
		for (let i = 0; i < expectedCount; i++) {
			new_admin.name = `test${i} john`;
			new_admin.email = `test0${i}@email.com`;
			admin = await adminService.create(new_admin);
		}
		const adminBody = {
			email: admin.email,
			_id: admin._id,
			role: env.ADMIN_ROLE,
		}
		adminToken = AuthenticationManager.createToken(adminBody);

		return agent.get('/api/admins/')
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.length).toBe(expectedCount);//Plus fixture admin created before test starts
				for (let i = 0; i < expectedCount; i++) {
					new_admin.name = `test${i} john`;
					new_admin.email = `test0${i}@email.com`;
					expect(res.body.body[i].name).toBe(new_admin.name);
					expect(res.body.body[i].email).toBe(new_admin.email);
				}
			});
	})

	test("GET /paginate", async () => {
		const new_admin = { email: "test00@email.com", photo: { key: "photo-key" }, name: "tester one", password: default_password };
		const expectedCount = 50;
		const admins = [];
		for (let i = 0; i < expectedCount; i++) {
			new_admin.name = `test${i} john`;
			new_admin.email = `test0${i}@email.com`;
			admins.push(await adminService.create(new_admin));
		}
		const adminbody = {
			email: admins[0].email,
			_id: admins[0]._id,
			role: env.ADMIN_ROLE,
		}
		adminToken = AuthenticationManager.createToken(adminbody);

		const limit = 15;
		const lastPageCount = 5;
		let j = 0;
		for (let page = 0; page < expectedCount / limit; page++) {
			return agent.get(`/api/admins/paginate?page=${page}&limit=${limit}`)
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
						expect(res.body.body[i]._id).toMatch(admins[j++]._id.toString());
					}
				});
		}

	})

	test("GET /count", async () => {
		const new_admin = {
			email: "test0@email.com",
			name: "test john",
			photo: { key: "photo-key" },
			password: default_password,
			role: env.PATIENT_ROLE,
		};
		const expectedCount = 10;
		let admin = null;
		for (let i = 0; i < expectedCount; i++) {
			new_admin.name = `test${i} john`;
			new_admin.email = `test0${i}@email.com`;
			admin = await adminService.create(new_admin);
		}

		const adminbody = {
			email: admin.email,
			_id: admin._id,
			role: env.ADMIN_ROLE,
		}
		adminToken = AuthenticationManager.createToken(adminbody);
		return agent.get("/api/admins/count")
			.set('Accept', 'application/json')
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.count).toBe(expectedCount);
			});

	})

	test("Test GET /:id", async () => {
		const newAdmin = { email: "first@email.com", name: "tester one", photo: { key: "photo-key" }, password: default_password };
		const thisAdmin = await adminService.create(newAdmin);

		return agent.get(`/api/admins/${thisAdmin._id.toString()}`)
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.name).toMatch(newAdmin.name);
				expect(res.body.body.email).toMatch(newAdmin.email);
			});
	})

	test("Test PUT /:id", async () => {
		const new_admin = { email: "admin@email.com", name: "tester admin", photo: { key: "photo-key" }, password: default_password };
		const admin = await adminService.create(new_admin);
		const adminbody = {
			email: admin.email,
			_id: admin._id,
			role: env.ADMIN_ROLE,
		}
		adminToken = AuthenticationManager.createToken(adminbody);
		const updated_patient = { email: "test000@email.com", name: "tester admin2" };

		return agent.put(`/api/admins/${admin._id.toString()}`)
			.set('Auth-Token', adminToken)
			.send(updated_patient)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.name).toMatch(updated_patient.name);
				expect(res.body.body.email).not.toMatch(updated_patient.email);
			});
	})

	test("Test DELETE /:id", async () => {
		const new_admin = { email: "first@email.com", name: "tester one", photo: { key: "photo-key" }, password: default_password };
		const admin = await adminService.create(new_admin);
		const adminbody = {
			email: admin.email,
			_id: admin._id,
			role: env.ADMIN_ROLE,
		}
		adminToken = AuthenticationManager.createToken(adminbody);
		return agent.delete(`/api/admins/${admin._id.toString()}`)
			.set('Auth-Token', adminToken)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				const deletedCount = 1;
				expect(res.body.body.deleted).toBe(deletedCount);
			});
	})

});
