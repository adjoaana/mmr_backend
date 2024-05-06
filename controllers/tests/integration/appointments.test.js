const request = require('supertest');
const app = require('../../app');
const db = require('../db');
const env = require("../../config");

const agent = request.agent(app);

const UserService = require('../../services/User.service');
const AdminService = require('../../services/Admin.service');
const AppointmentService = require("../../services/Appointment.service");
const HealthProfessionalTypeService = require('../../services/HealthProfessionalType.service');
const AuthenticationManager = require("../../utils/Authentication.manager");

const healthProfessionalTypeService = new HealthProfessionalTypeService();
const adminService = new AdminService();;
const userService = new UserService();
const appointmentService = new AppointmentService();
let healthProfessionalType = null;
let patient = null;
let patient_token = null;
let healthProfessional = null;
let healthProfessional_token = null;
let admin = null;
let admin_token = null;

beforeAll(async () => {
	await db.connect();
});
afterAll(async () => {
	const response = await db.close()
	return response;
});
beforeEach(async () => {
	await db.clear();
	const new_admin = { email: "admin@email.com", name: "tester one", photo: { key: "photo-key" }, password: "my_pass" };
	const new_patient = { email: "test@email.com", name: "tester one", photo: { key: "photo-key" }, password: "my_pass", role: env.PATIENT_ROLE };
	const new_healthProfessional = { email: "test1@email.com", name: "tester one", photo: { key: "photo-key" }, password: "my_pass", role: env.HEALTH_PROFESSIONAL_ROLE };
	const new_healthProfessionalType = { name: "physio" }

	healthProfessionalType = await healthProfessionalTypeService.create(new_healthProfessionalType);
	patient = await userService.create(new_patient);
	admin = await adminService.create(new_admin);
	healthProfessional = await userService.create(new_healthProfessional);

	const patient_body = {
		email: patient.email,
		_id: patient._id,
		role: env.PATIENT_ROLE,
		creator: patient.creator,
	}

	const admin_body = {
		email: admin.email,
		_id: admin._id,
		role: env.ADMIN_ROLE,
	}
	const healthProfessional_body = {
		email: healthProfessional.email,
		_id: healthProfessional._id,
		role: env.HEALTH_PROFESSIONAL_ROLE,
		creator: healthProfessional.creator,
	}

	admin_token = AuthenticationManager.createToken(admin_body);
	patient_token = AuthenticationManager.createToken(patient_body);
	healthProfessional_token = AuthenticationManager.createToken(healthProfessional_body);
});

describe("Appointments User Endpoints /api/appointments/users/", () => {
	test("POST /", async () => {
		const new_appointment = {
			healthProfessionalType: healthProfessionalType._id.toString(),
			timestamp: new Date().getTime()
		}
		const expectedDefault = {
			type: "online",
			status: "pending"
		}
		return agent.post('/api/appointments/users')
			.send(new_appointment)
			.set('Auth-Token', patient_token)
			.set('Accept', 'application/json')
			.expect(201)
			.then(res => {
				expect(patient._id.equals(res.body.body.patient)).toBeTruthy();
				expect(new_appointment.healthProfessionalType).toMatch(res.body.body.healthProfessionalType);
				expect(res.body.body.timestamp).toBe(new_appointment.timestamp);
				expect(res.body.body.status).toMatch(expectedDefault.status);
				expect(res.body.body.type).toMatch(expectedDefault.type);
			});
	})

	test("GET /:id", async () => {
		const new_appointment = {
			patient: patient._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime()
		}
		const expectedDefault = {
			type: "online",
			status: "pending"
		}
		const appointment = await appointmentService.create(new_appointment);

		return agent.get(`/api/appointments/users/${appointment._id.toString()}`)
			.set('Auth-Token', patient_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body._id).toMatch(appointment._id.toString());
				expect(new_appointment.patient.equals(res.body.body.patient._id)).toBeTruthy();
				expect(new_appointment.healthProfessionalType.equals(res.body.body.healthProfessionalType._id)).toBeTruthy();
				expect(res.body.body.timestamp).toBe(new_appointment.timestamp);
				expect(res.body.body.status).toMatch(expectedDefault.status);
				expect(res.body.body.type).toMatch(expectedDefault.type);
			});
	})

	test("GET /count", async () => {
		const time = new Date().getTime();
		const new_appointment = {
			patient: patient._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: time
		}
		const expectedCount = 5;
		for (let i = 0; i < expectedCount; i++) {
			await appointmentService.create(new_appointment);
		}

		return agent.get('/api/appointments/users/count')
			.set('Accept', 'application/json')
			.set('Auth-Token', patient_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.count).toBe(expectedCount);
			});
	})

	test("PUT /:id patient", async () => {
		const new_appointment = {
			patient: patient._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime()
		}

		const appointment = await appointmentService.create(new_appointment);
		const expectedDefault = {
			type: "offline",
			status: "approved",
			timestamp: new_appointment.timestamp + 10000
		}

		return agent.put(`/api/appointments/users/${appointment._id.toString()}`)
			.send(expectedDefault)
			.set('Auth-Token', patient_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.timestamp).toBe(new_appointment.timestamp + 10000);
				expect(res.body.body.status).toMatch(expectedDefault.status);
				expect(res.body.body.type).toMatch(expectedDefault.type);
			});
	})

	test("DELETE /:id patient", async () => {
		const new_appointment = {
			patient: patient._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime()
		}
		expectedDefault = {
			type: "online",
			status: "pending"
		}
		const appointment = await appointmentService.create(new_appointment);
		return agent.delete(`/api/appointments/users/${appointment._id.toString()}`)
			.set('Auth-Token', patient_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(async res => {
				const deletedCount = 1;
				expect(res.body.body.deleted).toBe(deletedCount);
				const deleteAppointment = await appointmentService.getOne(appointment._id.toString());
				expect(deleteAppointment).toBeNull();
			});
	})

	test("DELETE /:id healthProfessional", async () => {
		const new_appointment = {
			patient: patient._id,
			healthProfessionalType: healthProfessionalType._id,
			healthProfessional: healthProfessional._id,
			timestamp: new Date().getTime()
		}
		expectedDefault = {
			type: "online",
			status: "pending"
		}
		const appointment = await appointmentService.create(new_appointment);
		return agent.delete(`/api/appointments/users/${appointment._id.toString()}`)
			.set('Auth-Token', healthProfessional_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(async res => {
				const deletedCount = 1;
				expect(res.body.body.deleted).toBe(deletedCount);
				const deleteAppointment = await appointmentService.getOne(appointment._id.toString());
				expect(deleteAppointment).toBeNull();
			});

	})
})



describe("Appointments Admin Endpoints /api/appointments/", () => {
	test("POST /", async () => {
		const new_appointment = {
			patient: patient._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime()
		}
		const expectedDefault = {
			type: "online",
			status: "pending"
		}
		return agent.post('/api/appointments/')
			.send(new_appointment)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(201)
			.then(res => {
				expect(new_appointment.patient.equals(res.body.body.patient)).toBeTruthy();
				expect(new_appointment.healthProfessionalType.equals(res.body.body.healthProfessionalType)).toBeTruthy();
				expect(res.body.body.timestamp).toBe(new_appointment.timestamp);
				expect(res.body.body.status).toMatch(expectedDefault.status);
				expect(res.body.body.type).toMatch(expectedDefault.type);
			});
	})
	test("GET /:id", async () => {
		const new_appointment = {
			patient: patient._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime()
		}

		const appointment = await appointmentService.create(new_appointment);

		expectedDefault = {
			type: "online",
			status: "pending"
		}
		return agent.get(`/api/appointments/${appointment._id.toString()}`)
			.set('Accept', 'application/json')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(new_appointment.patient.equals(res.body.body.patient._id)).toBeTruthy();
				expect(new_appointment.healthProfessionalType.equals(res.body.body.healthProfessionalType._id)).toBeTruthy();
				expect(res.body.body.timestamp).toBe(new_appointment.timestamp);
				expect(res.body.body.status).toMatch(expectedDefault.status);
				expect(res.body.body.type).toMatch(expectedDefault.type);
			});
	})
	test("GET /count", async () => {
		const time = new Date().getTime();
		const new_appointment = {
			patient: patient._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: time
		}
		expectedDefault = {
			type: "online",
			status: "pending"
		}
		const expectedCount = 5;
		for (let i = 0; i < expectedCount; i++) {
			new_appointment.timestamp = time + (i * 360000 * 60 * 24); // Add a date to timestamp
			await appointmentService.create(new_appointment);
		}

		return agent.get('/api/appointments/count')
			.set('Accept', 'application/json')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.count).toBe(expectedCount);
			});
	})

	test("DELETE /:id", async () => {
		const new_appointment = {
			patient: patient._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime()
		}
		expectedDefault = {
			type: "online",
			status: "pending"
		}
		const appointment = await appointmentService.create(new_appointment);

		return agent.delete(`/api/appointments/${appointment._id.toString()}`)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(async res => {
				const deletedCount = 1;
				expect(res.body.body.deleted).toBe(deletedCount);
				const deleteAppointment = await appointmentService.getOne(appointment._id.toString());
				expect(deleteAppointment).toBeNull();
			});

	})
})