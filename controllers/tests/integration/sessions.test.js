const request = require('supertest');
const app = require('../../app');
const db = require('../db');
const env = require("../../config");

const agent = request.agent(app);

const UserService = require('../../services/User.service');
const AdminService = require('../../services/Admin.service');
const SessionService = require("../../services/Session.service");
const HealthProfessionalTypeService = require('../../services/HealthProfessionalType.service');
const AuthenticationManager = require("../../utils/Authentication.manager");
const ExerciseService = require('../../services/Exercise.service');
const AppointmentService = require("../../services/Appointment.service");
const BodyPartService = require('../../services/BodyPart.service');

const healthProfessionalTypeService = new HealthProfessionalTypeService();
const adminService = new AdminService();
const userService = new UserService();;
const sessionService = new SessionService();
const exerciseService = new ExerciseService();
const appointmentService = new AppointmentService();

let healthProfessionalType = null;
let patient = null;
let patient_token = null;
let healthProfessional = null;
let healthProfessional_token = null;
let admin = null;
let admin_token = null;
let appointment = null;
let new_appointment = null;

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
	new_appointment = {
		patient: patient._id,
		healthProfessional: healthProfessional._id,
		healthProfessionalType: healthProfessionalType._id,
		timestamp: new Date().getTime()
	}
	appointment = await appointmentService.create(new_appointment);

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
	}

	admin_token = AuthenticationManager.createToken(admin_body);
	patient_token = AuthenticationManager.createToken(patient_body);
	healthProfessional_token = AuthenticationManager.createToken(healthProfessional_body);
});

describe("Sessions User Endpoints /api/sessions/users/", () => {
	test("POST /", async () => {
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime(),
			type: "online"
		}
		const expectedDefault = {
			status: "booked"
		}
		return agent.post('/api/sessions/users')
			.send(new_session)
			.set('Auth-Token', healthProfessional_token)
			.set('Accept', 'application/json')
			.expect(201)
			.then(res => {
				expect(new_session.patient.equals(res.body.body.patient)).toBeTruthy();
				expect(new_session.appointment.equals(res.body.body.appointment)).toBeTruthy();
				expect(new_session.healthProfessional.equals(res.body.body.healthProfessional)).toBeTruthy();
				expect(new_session.healthProfessionalType.equals(res.body.body.healthProfessionalType)).toBeTruthy();
				expect(res.body.body.timestamp).toBe(new_session.timestamp);
				expect(res.body.body.status).toMatch(expectedDefault.status);
				expect(res.body.body.type).toMatch(new_session.type);
			});
	})

	test("GET /:id", async () => {
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime(),
			type: "online"
		}
		const expectedDefault = {
			status: "booked"
		}
		const session = await sessionService.create(new_session);

		return agent.get(`/api/sessions/users/${session._id.toString()}`)
			.set('Accept', 'application/json')
			.set('Auth-Token', healthProfessional_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(new_session.patient.equals(res.body.body.patient._id)).toBeTruthy();
				expect(new_session.appointment.equals(res.body.body.appointment._id)).toBeTruthy();
				expect(new_session.healthProfessional.equals(res.body.body.healthProfessional._id)).toBeTruthy();
				expect(new_session.healthProfessionalType.equals(res.body.body.healthProfessionalType._id)).toBeTruthy();
				expect(res.body.body.timestamp).toBe(new_session.timestamp);
				expect(res.body.body.type).toMatch(new_session.type);
				expect(res.body.body.status).toMatch(expectedDefault.status);
			});
	})

	test("GET /", async () => {
		const time = new Date().getTime();
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: time,
			type: "online"
		}
		const expectedDefault = {
			status: "booked"
		}
		const expectedCount = 5;
		appointment = [];
		for (let i = 0; i < expectedCount; i++) {
			const appointment1 = await appointmentService.create(new_appointment);
			appointment.push(appointment1);
			new_session.appointment = appointment1._id;
			new_session.timestamp = time + (i * 360000 * 60 * 24); // Add a date to timestamp
			await sessionService.create(new_session);
		}

		return agent.get('/api/sessions/users')
			.set('Accept', 'application/json')
			.set('Auth-Token', healthProfessional_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.length).toBe(expectedCount);
				for (let i = expectedCount - 1, j = 0; i >= 0; i--, j++) {
					new_session.timestamp = time + (i * 360000 * 60 * 24); // Add a date to timestamp
					expect(new_session.patient.equals(res.body.body[i].patient._id)).toBeTruthy();
					expect(appointment[j]._id.equals(res.body.body[i].appointment._id)).toBeTruthy();
					expect(new_session.healthProfessional.equals(res.body.body[i].healthProfessional._id)).toBeTruthy();
					expect(new_session.healthProfessionalType.equals(res.body.body[i].healthProfessionalType._id)).toBeTruthy();
					expect(res.body.body[j].timestamp).toBe(new_session.timestamp);
					expect(res.body.body[j].type).toMatch(new_session.type);
					expect(res.body.body[j].status).toMatch(expectedDefault.status);
				}
			});
	})

	test("GET /count", async () => {
		const time = new Date().getTime();
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: time,
			type: "online"
		}
		const expectedCount = 5;
		for (let i = 0; i < expectedCount; i++) {
			appointment = await appointmentService.create(new_appointment);
			new_session.appointment = appointment._id;
			await sessionService.create(new_session);
		}

		return agent.get('/api/sessions/users/count')
			.set('Accept', 'application/json')
			.set('Auth-Token', healthProfessional_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.count).toBe(expectedCount);
			});
	})

	test("GET /past", async () => {
		const time = new Date().getTime();
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: time,
			type: "online"
		}
		const expectedDefault = {
			status: "booked"
		}
		const expectedCount = 5;
		const appointment_up = [];
		const appointment_past = [];

		// Create future sessions
		for (let i = 0; i < expectedCount; i++) {
			const appointment1 = await appointmentService.create(new_appointment);
			appointment_up.push(appointment1);
			new_session.appointment = appointment1._id;
			new_session.timestamp = time + ((i + 1) * 60000 * 10); // Add a date to timestamp
			await sessionService.create(new_session);
		}

		// Create past sessions
		for (let i = 0; i < expectedCount; i++) {
			const appointment1 = await appointmentService.create(new_appointment);
			appointment_past.push(appointment1);
			new_session.appointment = appointment1._id;
			new_session.timestamp = time - ((i + 1) * 60001 * 15); // Add a date to timestamp
			await sessionService.create(new_session);
		}

		return agent.get('/api/sessions/users/past')
			.set('Accept', 'application/json')
			.set('Auth-Token', healthProfessional_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.length).toBe(expectedCount);
				for (let i = expectedCount - 1; i >= 0; i--) {
					new_session.timestamp = time - ((i + 1) * 60001 * 15); // Add a date to timestamp
					expect(new_session.patient.equals(res.body.body[i].patient._id)).toBeTruthy();
					expect(appointment_past[i]._id.equals(res.body.body[i].appointment._id)).toBeTruthy();
					expect(new_session.healthProfessional.equals(res.body.body[i].healthProfessional._id)).toBeTruthy();
					expect(new_session.healthProfessionalType.equals(res.body.body[i].healthProfessionalType._id)).toBeTruthy();
					expect(res.body.body[i].timestamp).toBe(new_session.timestamp);
					expect(res.body.body[i].type).toMatch(new_session.type);
					expect(res.body.body[i].status).toMatch(expectedDefault.status);
				}
			});
	})

	test("GET /upcoming", async () => {
		const time = new Date().getTime();
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: time,
			type: "online"
		}
		const expectedDefault = {
			status: "booked"
		}
		const expectedCount = 5;

		const appointment_up = [];
		const appointment_past = [];

		// Create future sessions
		for (let i = 0; i < expectedCount; i++) {
			const appointment1 = await appointmentService.create(new_appointment);
			appointment_up.push(appointment1);
			new_session.appointment = appointment1._id;
			new_session.timestamp = time + ((i + 1) * 60000 * 10); // Add a date to timestamp
			await sessionService.create(new_session);
		}

		// Create past sessions
		for (let i = 0; i < expectedCount; i++) {
			const appointment1 = await appointmentService.create(new_appointment);
			appointment_past.push(appointment1);
			new_session.appointment = appointment1._id;
			new_session.timestamp = time - ((i + 1) * 60001 * 15); // Add a date to timestamp
			await sessionService.create(new_session);
		}
		return agent.get('/api/sessions/users/upcoming')
			.set('Accept', 'application/json')
			.set('Auth-Token', healthProfessional_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.length).toBe(expectedCount);
				for (let i = expectedCount - 1, j = 0; i >= 0; i--, j++) {
					new_session.timestamp = time + ((i + 1) * 60000 * 10); // Add a date to timestamp
					expect(new_session.patient.equals(res.body.body[j].patient._id)).toBeTruthy();
					expect(appointment_up[i]._id.equals(res.body.body[j].appointment._id)).toBeTruthy();
					expect(new_session.healthProfessional.equals(res.body.body[j].healthProfessional._id)).toBeTruthy();
					expect(new_session.healthProfessionalType.equals(res.body.body[j].healthProfessionalType._id)).toBeTruthy();
					expect(res.body.body[j].timestamp).toBe(new_session.timestamp);
					expect(res.body.body[j].type).toMatch(new_session.type);
					expect(res.body.body[j].status).toMatch(expectedDefault.status);
				}
			});
	})

	test("GET /paginate", async () => {
		const time = new Date().getTime();
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: time,
			type: "online"
		}
		const expectedDefault = {
			status: "booked"
		}
		const expectedCount = 50;
		appointment = [];

		for (let i = 0; i < expectedCount; i++) {
			const appointment1 = await appointmentService.create(new_appointment);
			appointment.push(appointment1);
			new_session.appointment = appointment1._id;
			new_session.timestamp = time + (i * 360000 * 60 * 24); // Add a date to timestamp
			await sessionService.create(new_session);
		}
		const limit = 15;
		let j = expectedCount - 1;
		for (let page = 0; page < expectedCount / limit; page++) {
			return agent.get(`/api/sessions/users/paginate?page=${page}&limit=${limit}`)
				.set('Accept', 'application/json')
				.set('Auth-Token', patient_token)
				.set('Accept', 'application/json')
				.expect(200)
				.then(res => {
					if (page > 2) {
						expect(res.body.body.length).toBe(5);
					}
					else {
						expect(res.body.body.length).toBe(limit);
					}

					const end = page > 2 ? 5 : limit;
					for (let i = 0; i < end; i++, j--) {
						new_session.timestamp = time + (j * 360000 * 60 * 24); // Add a date to timestamp
						expect(new_session.patient.equals(res.body.body[i].patient._id)).toBeTruthy();
						expect(appointment[j]._id.equals(res.body.body[i].appointment._id)).toBeTruthy();
						expect(new_session.healthProfessional.equals(res.body.body[i].healthProfessional._id)).toBeTruthy();
						expect(new_session.healthProfessionalType.equals(res.body.body[i].healthProfessionalType._id)).toBeTruthy();
						expect(res.body.body[i].timestamp).toBe(new_session.timestamp);
						expect(res.body.body[i].type).toMatch(new_session.type);
						expect(res.body.body[i].status).toMatch(expectedDefault.status);
					}
				});
		}

	})

	test("PUT /:id", async () => {
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime(),
			type: "online",
		}

		const session = await sessionService.create(new_session);
		const expectedDefault = {
			type: "offline",
			status: "approved",
			timestamp: new_session.timestamp + 10000
		}
		return agent.put(`/api/sessions/users/${session._id.toString()}`)
			.send(expectedDefault)
			.set('Auth-Token', healthProfessional_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.timestamp).toBe(new_session.timestamp + 10000);
				expect(res.body.body.status).toMatch(expectedDefault.status);
				expect(res.body.body.type).toMatch(expectedDefault.type);
			});
	})

	test("PUT /:id/diagnosis", async () => {
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime(),
			type: "online",
		}
		const session = await sessionService.create(new_session);

		const diagnosis = {
			HPC: "This is the HPC",
			PC: "This is the PC",
			PMHx: "This is the PMHx",
			DHx: "This is the DHx",
			FSHx: "This is the FSHx",
			OE: "This is the OE",
			investigation: "This is the investigation",
			physicalDiagnosis: "This is the physicalDiagnosis",
			plan: "This is the plan",
			note: "This is the note",
			recommendation: "This is the recommendation",
		}
		return agent.put(`/api/sessions/users/${session._id.toString()}/diagnosis`)
			.send(diagnosis)
			.set('Auth-Token', healthProfessional_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.diagnosis.HPC).toMatch(diagnosis.HPC);
				expect(res.body.body.diagnosis.PMHx).toMatch(diagnosis.PMHx);
				expect(res.body.body.diagnosis.DHx).toMatch(diagnosis.DHx);
				expect(res.body.body.diagnosis.FSHx).toMatch(diagnosis.FSHx);
				expect(res.body.body.diagnosis.OE).toMatch(diagnosis.OE);
				expect(res.body.body.diagnosis.investigation).toMatch(diagnosis.investigation);
				expect(res.body.body.diagnosis.physicalDiagnosis).toMatch(diagnosis.physicalDiagnosis);
				expect(res.body.body.diagnosis.plan).toMatch(diagnosis.plan);
				expect(res.body.body.diagnosis.note).toMatch(diagnosis.note);
				expect(res.body.body.diagnosis.recommendation).toMatch(diagnosis.recommendation);
			});
	})

	test("PUT /:id/exercise/:exerciseId", async () => {
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime(),
			type: "online",
		}
		const session = await sessionService.create(new_session);

		const bodyPartService = new BodyPartService();
		const temp = {
			name: "part1",
			description: "desc"
		}

		const part = await bodyPartService.create(temp);

		const new_exercise = {
			title: "Test Exercise",
			description: "This is the test description",
			bodyPart: part._id,
			creator: {
				userRole: env.ADMIN_ROLE,
				admin: admin._id
			},
			lastEditor: {
				userRole: env.ADMIN_ROLE,
				admin: admin._id
			},
			video: {
				url: "/video.mp4",
				key: "test-video",
			},
			audio: {
				url: "/audio.mp3",
				key: "test-audio",
			},
			thumbImage: {
				url: "/video.jpg",
				key: "test-thumbImage",
			},
			image: {
				url: "/image.jpg",
				key: "test-image",
			}
		}

		const exercise = await exerciseService.create(new_exercise);

		const data = {
			exercise: exercise._id.toString(),
			sets: 15,
			reps: 10,
			time: 100,
			distance: 152,
			note: "This is a note",
			intensity: "This is the intensity"
		}
		return agent.put(`/api/sessions/users/${session._id.toString()}/exercise`)
			.send(data)
			.set('Auth-Token', healthProfessional_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				const count = res.body.body.exercises.length;
				expect(res.body.body.exercises[count - 1].exercise).toMatch(exercise._id.toString());
				expect(res.body.body.exercises[count - 1].sets).toBe(data.sets);
				expect(res.body.body.exercises[count - 1].reps).toBe(data.reps);
				expect(res.body.body.exercises[count - 1].time).toBe(data.time);
				expect(res.body.body.exercises[count - 1].distance).toBe(data.distance);
				expect(res.body.body.exercises[count - 1].note).toMatch(data.note);
				expect(res.body.body.exercises[count - 1].intensity).toMatch(data.intensity);
			});
	})

	test("PUT /:id/exercises/:exerciseId", async () => {
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime(),
			type: "online",
		}
		const session = await sessionService.create(new_session);
		const bodyPartService = new BodyPartService();
		const temp = {
			name: "part1",
			description: "desc"
		}

		const part = await bodyPartService.create(temp);
		const new_exercise = {
			title: "Test Exercise",
			description: "This is the test description",
			bodyPart: part._id,
			creator: {
				userRole: env.ADMIN_ROLE,
				admin: admin._id
			},
			lastEditor: {
				userRole: env.ADMIN_ROLE,
				admin: admin._id
			},
			video: {
				url: "/video.mp4",
				key: "test-video",
			},
			audio: {
				url: "/audio.mp3",
				key: "test-audio",
			},
			thumbImage: {
				url: "/video.jpg",
				key: "test-thumbImage",
			},
			image: {
				url: "/image.jpg",
				key: "test-image",
			}
		}


		const expectedCount = 5;
		let exercise;

		let data = [];
		for (let i = 0; i < expectedCount; i++) {
			exercise = await exerciseService.create(new_exercise);
			data.push(
				{
					exercise: exercise._id.toString(),
					sets: i + 5,
					reps: i + 10,
					time: i + 50,
					distance: i + 15,
					note: "This is a note",
					intensity: "This is the intensity"
				}
			)
		}
		data = await sessionService.addExercises({
			user_id: healthProfessional._id.toString(),
			_id: session._id.toString(),
			data
		});
		let changeExercise = data.exercises[0];
		let expected = { status: "viewed", patientComment: "Test comment" };
		await agent.put(`/api/sessions/users/${session._id}/exercises/${changeExercise._id}`)
			.send(expected)
			.set('Auth-Token', patient_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.status).toBe(expected.status);
				expect(res.body.body.patientComment).toBe(expected.patientComment);
			});
		changeExercise = data.exercises[1];
		expected = { status: "completed", patientComment: "Test comment 2" };
		await agent.put(`/api/sessions/users/${session._id}/exercises/${changeExercise._id}`)
			.send(expected)
			.set('Auth-Token', patient_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.status).toBe(expected.status);
				expect(res.body.body.patientComment).toBe(expected.patientComment);
			});
	})

	test("PUT /:id/exercises", async () => {
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime(),
			type: "online",
		}
		const session = await sessionService.create(new_session);
		const bodyPartService = new BodyPartService();
		const temp = {
			name: "part1",
			description: "desc"
		}

		const part = await bodyPartService.create(temp);
		const new_exercise = {
			title: "Test Exercise",
			description: "This is the test description",
			bodyPart: part._id,
			creator: {
				userRole: env.ADMIN_ROLE,
				admin: admin._id
			},
			lastEditor: {
				userRole: env.ADMIN_ROLE,
				admin: admin._id
			},
			video: {
				url: "/video.mp4",
				key: "test-video",
			},
			audio: {
				url: "/audio.mp3",
				key: "test-audio",
			},
			thumbImage: {
				url: "/video.jpg",
				key: "test-thumbImage",
			},
			image: {
				url: "/image.jpg",
				key: "test-image",
			}
		}


		const expectedCount = 5;
		let exercise;

		const data = [];
		for (let i = 0; i < expectedCount; i++) {
			exercise = await exerciseService.create(new_exercise);
			data.push(
				{
					exercise: exercise._id.toString(),
					sets: i + 5,
					reps: i + 10,
					time: i + 50,
					distance: i + 15,
					note: "This is a note",
					intensity: "This is the intensity"
				}
			)
		}

		return agent.put(`/api/sessions/users/${session._id.toString()}/exercises`)
			.send(data)
			.set('Auth-Token', healthProfessional_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				for (let i = 0; i < expectedCount; i++) {
					expect(res.body.body.exercises[i].exercise).toMatch(data[i].exercise);
					expect(res.body.body.exercises[i].sets).toBe(data[i].sets);
					expect(res.body.body.exercises[i].reps).toBe(data[i].reps);
					expect(res.body.body.exercises[i].time).toBe(data[i].time);
					expect(res.body.body.exercises[i].distance).toBe(data[i].distance);
					expect(res.body.body.exercises[i].note).toMatch(data[i].note);
					expect(res.body.body.exercises[i].intensity).toMatch(data[i].intensity);
				}
			});
	})

	test("DELETE /:id", async () => {
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime(),
			type: "online"
		}

		const session = await sessionService.create(new_session);

		return agent.delete(`/api/sessions/users/${session._id.toString()}`)
			.set('Auth-Token', healthProfessional_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(async res => {
				const deletedCount = 1;
				expect(res.body.body.deleted).toBe(deletedCount);
				const deleteSession = await sessionService.getOne(session._id.toString());
				expect(deleteSession).toBeNull();
			});

	})
})


describe("Sessions Admin Endpoints /api/sessions/", () => {
	test("POST /", async () => {
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime(),
			type: "online"
		}
		const expectedDefault = {
			status: "booked"
		}
		return agent.post('/api/sessions/')
			.send(new_session)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(201)
			.then(res => {
				expect(new_session.patient.equals(res.body.body.patient)).toBeTruthy();
				expect(new_session.appointment.equals(res.body.body.appointment)).toBeTruthy();
				expect(new_session.healthProfessional.equals(res.body.body.healthProfessional)).toBeTruthy();
				expect(new_session.healthProfessionalType.equals(res.body.body.healthProfessionalType)).toBeTruthy();
				expect(res.body.body.timestamp).toBe(new_session.timestamp);
				expect(res.body.body.status).toMatch(expectedDefault.status);
				expect(res.body.body.type).toMatch(new_session.type);
			});
	})

	test("GET /:id", async () => {
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime(),
			type: "online"
		}
		const expectedDefault = {
			status: "booked"
		}
		const session = await sessionService.create(new_session);

		return agent.get(`/api/sessions/${session._id.toString()}`)
			.set('Accept', 'application/json')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(new_session.patient.equals(res.body.body.patient._id)).toBeTruthy();
				expect(new_session.appointment.equals(res.body.body.appointment._id)).toBeTruthy();
				expect(new_session.healthProfessional.equals(res.body.body.healthProfessional._id)).toBeTruthy();
				expect(new_session.healthProfessionalType.equals(res.body.body.healthProfessionalType._id)).toBeTruthy();
				expect(res.body.body.timestamp).toBe(new_session.timestamp);
				expect(res.body.body.type).toMatch(new_session.type);
				expect(res.body.body.status).toMatch(expectedDefault.status);
			});
	})

	test("GET /", async () => {
		const time = new Date().getTime();
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: time,
			type: "online"
		}
		const expectedDefault = {
			status: "booked"
		}
		const expectedCount = 5;
		appointment = [];
		for (let i = 0; i < expectedCount; i++) {
			const appointment1 = await appointmentService.create(new_appointment);
			appointment.push(appointment1);
			new_session.appointment = appointment1._id;
			new_session.timestamp = time + (i * 360000 * 60 * 24); // Add a date to timestamp
			await sessionService.create(new_session);
		}

		return agent.get('/api/sessions/')
			.set('Accept', 'application/json')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.length).toBe(expectedCount);
				for (let i = expectedCount - 1, j = 0; i >= 0; i--, j++) {
					new_session.timestamp = time + (i * 360000 * 60 * 24); // Add a date to timestamp
					expect(new_session.patient.equals(res.body.body[j].patient._id)).toBeTruthy();
					expect(appointment[i]._id.equals(res.body.body[j].appointment._id)).toBeTruthy();
					expect(new_session.healthProfessional.equals(res.body.body[j].healthProfessional._id)).toBeTruthy();
					expect(new_session.healthProfessionalType.equals(res.body.body[j].healthProfessionalType._id)).toBeTruthy();
					expect(res.body.body[j].timestamp).toBe(new_session.timestamp);
					expect(res.body.body[j].type).toMatch(new_session.type);
					expect(res.body.body[j].status).toMatch(expectedDefault.status);
				}
			});
	})

	test("GET /past", async () => {
		const time = new Date().getTime();
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: time,
			type: "online"
		}
		const expectedDefault = {
			status: "booked"
		}
		const expectedCount = 5;
		const appointment_up = [];
		const appointment_past = [];

		// Create future sessions
		for (let i = 0; i < expectedCount; i++) {
			const appointment1 = await appointmentService.create(new_appointment);
			appointment_up.push(appointment1);
			new_session.appointment = appointment1._id;
			new_session.timestamp = time + ((i + 1) * 60000 * 10); // Add a date to timestamp
			await sessionService.create(new_session);
		}

		// Create past sessions
		for (let i = 0; i < expectedCount; i++) {
			const appointment1 = await appointmentService.create(new_appointment);
			appointment_past.push(appointment1);
			new_session.appointment = appointment1._id;
			new_session.timestamp = time - ((i + 1) * 60001 * 15); // Add a date to timestamp
			await sessionService.create(new_session);
		}

		return agent.get('/api/sessions/past')
			.set('Accept', 'application/json')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.length).toBe(expectedCount);
				for (let i = expectedCount - 1; i >= 0; i--) {
					new_session.timestamp = time - ((i + 1) * 60001 * 15); // Add a date to timestamp
					expect(new_session.patient.equals(res.body.body[i].patient._id)).toBeTruthy();
					expect(appointment_past[i]._id.equals(res.body.body[i].appointment._id)).toBeTruthy();
					expect(new_session.healthProfessional.equals(res.body.body[i].healthProfessional._id)).toBeTruthy();
					expect(new_session.healthProfessionalType.equals(res.body.body[i].healthProfessionalType._id)).toBeTruthy();
					expect(res.body.body[i].timestamp).toBe(new_session.timestamp);
					expect(res.body.body[i].type).toMatch(new_session.type);
					expect(res.body.body[i].status).toMatch(expectedDefault.status);
				}
			});
	})

	test("GET /upcoming", async () => {
		const time = new Date().getTime();
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: time,
			type: "online"
		}
		const expectedDefault = {
			status: "booked"
		}
		const expectedCount = 5;

		const appointment_up = [];
		const appointment_past = [];

		// Create future sessions
		for (let i = 0; i < expectedCount; i++) {
			const appointment1 = await appointmentService.create(new_appointment);
			appointment_up.push(appointment1);
			new_session.appointment = appointment1._id;
			new_session.timestamp = time + ((i + 1) * 60000 * 10); // Add a date to timestamp
			await sessionService.create(new_session);
		}

		// Create past sessions
		for (let i = 0; i < expectedCount; i++) {
			const appointment1 = await appointmentService.create(new_appointment);
			appointment_past.push(appointment1);
			new_session.appointment = appointment1._id;
			new_session.timestamp = time - ((i + 1) * 60001 * 15); // Add a date to timestamp
			await sessionService.create(new_session);
		}

		return agent.get('/api/sessions/upcoming')
			.set('Accept', 'application/json')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.length).toBe(expectedCount);
				for (let i = expectedCount - 1, j = 0; i >= 0; i--, j++) {
					new_session.timestamp = time + ((i + 1) * 60000 * 10); // Add a date to timestamp
					expect(new_session.patient.equals(res.body.body[j].patient._id)).toBeTruthy();
					expect(appointment_up[i]._id.equals(res.body.body[j].appointment._id)).toBeTruthy();
					expect(new_session.healthProfessional.equals(res.body.body[j].healthProfessional._id)).toBeTruthy();
					expect(new_session.healthProfessionalType.equals(res.body.body[j].healthProfessionalType._id)).toBeTruthy();
					expect(res.body.body[j].timestamp).toBe(new_session.timestamp);
					expect(res.body.body[j].type).toMatch(new_session.type);
					expect(res.body.body[j].status).toMatch(expectedDefault.status);
				}
			});
	})

	test("GET /paginate", async () => {
		const time = new Date().getTime();
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: time,
			type: "online"
		}
		const expectedDefault = {
			status: "booked"
		}
		const expectedCount = 50;
		appointment = [];
		for (let i = 0; i < expectedCount; i++) {
			const appointment1 = await appointmentService.create(new_appointment);
			appointment.push(appointment1);
			new_session.appointment = appointment1._id;
			new_session.timestamp = time + (i * 360000 * 60 * 24); // Add a date to timestamp
			await sessionService.create(new_session);
		}
		const limit = 15;
		let j = expectedCount - 1;
		for (let page = 0; page < expectedCount / limit; page++) {
			return agent.get(`/api/sessions/paginate?page=${page}&limit=${limit}`)
				.set('Accept', 'application/json')
				.set('Auth-Token', admin_token)
				.set('Accept', 'application/json')
				.expect(200)
				.then(res => {
					if (page > 2) {
						expect(res.body.body.length).toBe(5);
					}
					else {
						expect(res.body.body.length).toBe(limit);
					}

					const end = page > 2 ? 5 : limit;
					for (let i = 0; i < end; i++, j--) {
						new_session.timestamp = time + (j * 360000 * 60 * 24); // Add a date to timestamp 
						expect(new_session.patient.equals(res.body.body[i].patient._id)).toBeTruthy();
						expect(appointment[j]._id.equals(res.body.body[i].appointment._id)).toBeTruthy();
						expect(new_session.healthProfessional.equals(res.body.body[i].healthProfessional._id)).toBeTruthy();
						expect(new_session.healthProfessionalType.equals(res.body.body[i].healthProfessionalType._id)).toBeTruthy();
						expect(res.body.body[i].timestamp).toBe(new_session.timestamp);
						expect(res.body.body[i].type).toMatch(new_session.type);
						expect(res.body.body[i].status).toMatch(expectedDefault.status);
					}
				});
		}

	})

	test("GET /count", async () => {
		const time = new Date().getTime();
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: time,
			type: "online"
		}

		const expectedCount = 5;
		for (let i = 0; i < expectedCount; i++) {
			appointment = await appointmentService.create(new_appointment);
			new_session.appointment = appointment._id;
			new_session.timestamp = time + (i * 360000 * 60 * 24); // Add a date to timestamp
			await sessionService.create(new_session);
		}

		return agent.get('/api/sessions/count')
			.set('Accept', 'application/json')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.count).toBe(expectedCount);
			});
	})

	test("PUT /:id", async () => {
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime(),
			type: "online",
		}

		const session = await sessionService.create(new_session);
		const expectedDefault = {
			type: "offline",
			status: "approved",
			timestamp: new_session.timestamp + 10000
		}
		return agent.put(`/api/sessions/${session._id.toString()}`)
			.send(expectedDefault)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.timestamp).toBe(new_session.timestamp + 10000);
				expect(res.body.body.status).toMatch(expectedDefault.status);
				expect(res.body.body.type).toMatch(expectedDefault.type);
			});
	})

	test("DELETE /:id", async () => {
		const new_session = {
			patient: patient._id,
			appointment: appointment._id,
			healthProfessional: healthProfessional._id,
			healthProfessionalType: healthProfessionalType._id,
			timestamp: new Date().getTime(),
			type: "online"
		}

		const session = await sessionService.create(new_session);

		return agent.delete(`/api/sessions/${session._id.toString()}`)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(async res => {
				const deletedCount = 1;
				expect(res.body.body.deleted).toBe(deletedCount);
				const deleteSession = await sessionService.getOne(session._id.toString());
				expect(deleteSession).toBeNull();
			});

	})

})