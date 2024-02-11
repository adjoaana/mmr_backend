const request = require('supertest');
const app = require('../../app');
const AuthenticationManager = require('../../utils/Authentication.manager');
const db = require('../db');

require("dotenv").config();
const env = require("../../config");
const agent = request.agent(app);

const UserService = require('../../services/User.service');
const AdminService = require('../../services/Admin.service');
const HealthProfessionalTypeService = require('../../services/HealthProfessionalType.service');

let healthProfessionalTypeService = null;
let adminService = null;
let userService = null;
let patient = null;
let patient_token = null;
let healthProfessional = null;
let healthProfessional_token = null;
let admin = null;
let admin_token = null;
let clinic = null;
let organization = null;
const default_password = "my_Pass232"

beforeAll(async () => {
	await db.connect();
	userService = new UserService();
	adminService = new AdminService();
	healthProfessionalTypeService = new HealthProfessionalTypeService();
});
afterAll(async () => {
	const response = await db.close()
	return response;
});
beforeEach(async () => {
	await db.clear();

	const new_admin = { email: "admin@email.com", photo: { key: "photo-key" }, name: "tester one", password: default_password };
	const new_patient = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: default_password, role: env.PATIENT_ROLE };
	const new_healthProfessional = { email: "test1@email.com", photo: { key: "photo-key" }, name: "tester one", password: default_password, role: env.HEALTH_PROFESSIONAL_ROLE };
	const new_organization = { email: "test2@email.com", photo: { key: "photo-key" }, name: "tester one", password: default_password, role: env.ORG_ROLE };
	const new_clinic = { email: "test3@email.com", photo: { key: "photo-key" }, name: "tester one", password: default_password, role: env.HEALTH_FACILITY_ROLE };
	const new_healthProfessionalType = { name: "physio" }

	healthProfessionalType = await healthProfessionalTypeService.create(new_healthProfessionalType);
	patient = await userService.create(new_patient);
	organization = await userService.create(new_organization);
	clinic = await userService.create(new_clinic);
	admin = await adminService.create(new_admin);
	healthProfessional = await userService.create(new_healthProfessional);

	const patientbody = {
		email: patient.email,
		_id: patient._id,
		role: env.PATIENT_ROLE,
		creator: patient.creator,
	}

	const adminbody = {
		email: admin.email,
		_id: admin._id,
		role: env.ADMIN_ROLE,
	}
	const healthProfessionalbody = {
		email: healthProfessional.email,
		_id: healthProfessional._id,
		role: env.HEALTH_PROFESSIONAL_ROLE,
		creator: healthProfessional.creator,
	}

	admin_token = AuthenticationManager.createToken(adminbody);
	patient_token = AuthenticationManager.createToken(patientbody);
	healthProfessional_token = AuthenticationManager.createToken(healthProfessionalbody);
});

describe("User Login Endpoint tests", () => {
	test("Patient login", async () => {
		const new_user_login = {
			email: patient.email,
			password: default_password,
		};
		const expected = {
			name: "tester one",
			status: 200,
			msg: "Login successful."
		}
		return agent.post('/api/users/login')
			.send(new_user_login)
			.expect(200)
			.then(res => {
				expect(res.body.token).toBeDefined();
				expect(res.body.msg).toMatch(expected.msg);
				expect(res.body.status).toBe(expected.status);

				const payload = AuthenticationManager.decodeToken(res.body.token);
				expect(payload.email).toMatch(new_user_login.email);
				expect(payload.name).toMatch(expected.name);
				expect(payload.role).toMatch(patient.role);
			});
	})

	test("Health Professional login", async () => {
		const new_user_login = {
			email: healthProfessional.email,
			password: default_password,
		};
		const expected = {
			name: "tester one",
			status: 200,
			msg: "Login successful."
		}
		return agent.post('/api/users/login')
			.send(new_user_login)
			.expect(200)
			.then(res => {
				expect(res.body.token).toBeDefined();
				expect(res.body.msg).toMatch(expected.msg);
				expect(res.body.status).toBe(expected.status);

				const payload = AuthenticationManager.decodeToken(res.body.token);
				expect(payload.email).toMatch(new_user_login.email);
				expect(payload.name).toMatch(expected.name);
				expect(payload.role).toMatch(healthProfessional.role);
			});
	})

	test("Health Facility login", async () => {
		const new_user_login = {
			email: clinic.email,
			password: default_password,
		};
		const expected = {
			name: "tester one",
			status: 200,
			msg: "Login successful."
		}
		return agent.post('/api/users/login')
			.send(new_user_login)
			.expect(200)
			.then(res => {
				expect(res.body.token).toBeDefined();
				expect(res.body.msg).toMatch(expected.msg);
				expect(res.body.status).toBe(expected.status);

				const payload = AuthenticationManager.decodeToken(res.body.token);
				expect(payload.email).toMatch(new_user_login.email);
				expect(payload.name).toMatch(expected.name);
				expect(payload.role).toMatch(clinic.role);
			});
	})

	test("Organization login", async () => {
		const new_user_login = {
			email: organization.email,
			password: default_password,
		};
		const expected = {
			name: "tester one",
			status: 200,
			msg: "Login successful."
		}
		return agent.post('/api/users/login')
			.send(new_user_login)
			.expect(200)
			.then(res => {
				expect(res.body.token).toBeDefined();
				expect(res.body.msg).toMatch(expected.msg);
				expect(res.body.status).toBe(expected.status);

				const payload = AuthenticationManager.decodeToken(res.body.token);
				expect(payload.email).toMatch(new_user_login.email);
				expect(payload.name).toMatch(expected.name);
				expect(payload.role).toMatch(organization.role);
			});
	})

	test("Login with wrong email", async () => {
		const new_user_login = {
			email: healthProfessional.email + "d",
			password: default_password,
		};

		const expected = {
			status: 400,
			msg: "Wrong login details."
		}
		return agent.post('/api/users/login')
			.send(new_user_login)
			.expect(expected.status)
			.then(res => {
				expect(res.body.msg).toMatch(expected.msg);
			});
	})
	test("Login with wrong password", async () => {
		const new_user_login = {
			email: healthProfessional.email,
			password: default_password + ";l",
		};
		const expected = {
			status: 400,
			msg: "Wrong login details."
		}
		return agent.post('/api/users/login')
			.send(new_user_login)
			.expect(expected.status)
			.then(res => {
				expect(res.body.msg).toMatch(expected.msg);
			});
	})

	test("Login with password less than 8", async () => {
		const new_user_login = {
			email: patient.email,
			password: "my_pa",
		};

		const expected = "Wrong login details."
		return agent.post('/api/users/login')
			.send(new_user_login)
			.expect(400)
			.then(res => {
				expect(res.body.msg).toMatch(expected);
			});
	})

	test("Login with wrong email format", async () => {
		const new_user_login = {
			email: "test1@email.",
			password: "my_4Pass23",
		};
		const expected = {
			status: 400,
			param: "email"
		}
		return agent.post('/api/users/login')
			.send(new_user_login)
			.expect(expected.status)
			.then(res => {
				expect(res.body.errors[0].param).toMatch(expected.param);
			});
	})

})

describe('General Users Endpoints /api/users/', () => {
	test("User Info", async () => {
		return agent.get('/api/users/info/')
			.set('Auth-Token', patient_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.name).toMatch(patient.name);
				expect(res.body.body.email).toMatch(patient.email);
				expect(res.body.body.role).toMatch(patient.role);
				expect(res.body.body.password).toBeUndefined();
			});
	})
});

