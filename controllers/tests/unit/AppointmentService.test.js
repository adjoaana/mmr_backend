const UserService = require('../../services/User.service');
const HealthProfessionalTypeService = require('../../services/HealthProfessionalType.service');
const AppointmentService = require('../../services/Appointment.service');
const db = require('../db');
const env = require("../../config");

let service = null;
let healthProfessionalTypeService = null;
let userService = null;
beforeAll(async () => await db.connect());
beforeEach(async () => {
	await db.clear();
	service = new AppointmentService();
	userService = new UserService();
	healthProfessionalTypeService = new HealthProfessionalTypeService();
});
afterAll(async () => {
	const response = await db.close()
	return response;
});


describe('Test AppointmentService methods', () => {
	test("create appointment method", async () => {
		const new_patient = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		const new_healthProfessionalType = { name: "physio" }

		const healthProfessionalType = await healthProfessionalTypeService.create(new_healthProfessionalType);
		const user = await userService.create(new_patient);

		const expected = {
			patient: user._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime()
		}

		const appointment = await service.create(expected);
		const default_status = "pending";

		expect(appointment.patient.equals(expected.patient)).toBeTruthy();
		expect(appointment.healthProfessionalType.equals(expected.healthProfessionalType)).toBeTruthy();
		expect(appointment.timestamp).toBe(expected.timestamp);
		expect(appointment.status).toMatch(default_status);
	});

	test("user_appointments method with pateint user_id", async () => {
		const new_patient = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		const new_patient2 = { email: "test1@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		const new_healthProfessionalType = { name: "physio" }

		const healthProfessionalType = await healthProfessionalTypeService.create(new_healthProfessionalType);
		const patient = await userService.create(new_patient);
		const patient2 = await userService.create(new_patient2);

		const new_appointment = {
			patient: patient._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime()
		}
		// Add 3 appointments
		const expected = 3;
		await service.create(new_appointment);
		await service.create(new_appointment);
		await service.create(new_appointment);

		new_appointment.patient = patient2._id;
		await service.create(new_appointment);
		await service.create(new_appointment);

		const user_appointments = await service.getUserAppointments(patient._id);

		expect(user_appointments.length).toBe(expected);
	});

	test("user_appointments method with healtProfessional user_id", async () => {
		const new_patient = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		const new_healthProfessional = { email: "test1@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: "pro" };
		const new_healthProfessional2 = { email: "test2@email.com", photo: { key: "photo-key" }, name: "tester two", password: "my_pass", role: "pro" };
		const new_healthProfessionalType = { name: "physio" }

		const healthProfessionalType = await healthProfessionalTypeService.create(new_healthProfessionalType);
		const patient = await userService.create(new_patient);
		const healthProfessional = await userService.create(new_healthProfessional);
		const new_appointment = {
			patient: patient._id,
			healthProfessionalType: healthProfessionalType._id,
			healthProfessional: healthProfessional._id,
			userCreator: healthProfessional._id,
			timestamp: new Date().getTime()
		}

		// Add 3 appointments
		const expected = 3;
		await service.create(new_appointment);
		await service.create(new_appointment);
		await service.create(new_appointment);

		new_appointment.healthProfessional = new_healthProfessional2._id;
		new_appointment.userCreator = new_healthProfessional2._id;

		await service.create(new_appointment);
		await service.create(new_appointment);

		const healthProfessional_appointments = await service.getUserAppointments(healthProfessional._id);

		expect(healthProfessional_appointments.length).toBe(expected);

	});

	test("approve appointment method", async () => {
		const new_patient = { email: "test@email.com", name: "tester one", photo: { key: "photo-key" }, password: "my_pass", role: env.PATIENT_ROLE };
		const new_healthProfessional = { email: "test1@email.com", name: "tester one", photo: { key: "photo-key" }, password: "my_pass", role: "pro" };
		const new_healthProfessionalType = { name: "physio" }

		const healthProfessionalType = await healthProfessionalTypeService.create(new_healthProfessionalType);
		const user = await userService.create(new_patient);
		const healthProfessional = await userService.create(new_healthProfessional);

		const new_appointment = {
			patient: user._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime()
		}

		const status = {
			default: "pending",
			approved: "approved"
		}

		const appointment = await service.create(new_appointment);
		expect(appointment.status).toMatch(status.default);

		const approved_appointment = await service.approve(appointment._id, healthProfessional._id)

		expect(approved_appointment.healthProfessional.equals(healthProfessional._id)).toBeTruthy();
		expect(approved_appointment.status).toMatch(status.approved);

	});
});
