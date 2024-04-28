const request = require('supertest');
const app = require('../../app');
const db = require('../db');
const env = require("../../config");

const agent = request.agent(app);

const AdminService = require('../../services/Admin.service');
const AuthenticationManager = require("../../utils/Authentication.manager");
const ExerciseService = require('../../services/Exercise.service');
const BodyPartService = require('../../services/BodyPart.service');

let adminService = null;
let exerciseService = null;
let admin = null;
let admin_token = null;
let bodyPartService = null;

beforeAll(async () => {
	await db.connect();
	exerciseService = new ExerciseService();
	adminService = new AdminService();
	bodyPartService = new BodyPartService();
});
afterAll(async () => {
	const response = await db.close()
	return response;
});
beforeEach(async () => {
	await db.clear();

	const new_admin = { email: "admin@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };

	admin = await adminService.create(new_admin);

	const admin_body = {
		email: admin.email,
		_id: admin._id,
		role: env.ADMIN_ROLE,
	}

	admin_token = AuthenticationManager.createToken(admin_body);
});

describe("Exercises Admin Endpoints /api/exercises/", () => {
	test("POST addTextOnly", async () => {
		const temp = {
			name: "part1",
			description: "desc"
		}
		const part = await bodyPartService.create(temp);

		const new_exercise = {
			title: "Test Exercise",
			description: "This is the test description",
			bodyPart: part._id
		}

		return agent.post('/api/exercises/text')
			.send(new_exercise)
			.set('Auth-Token', admin_token)
			.expect(201)
			.then(res => {
				expect(res.body.body.title).toMatch(new_exercise.title);
				expect(res.body.body.description).toMatch(new_exercise.description);
				expect(res.body.body.bodyPart).toMatch(part._id.toString());
				expect(res.body.body.video.key).toBeDefined();
				expect(res.body.body.image.key).toBeDefined();
				expect(res.body.body.audio.key).toBeDefined();
				expect(res.body.body.thumbImage.key).toBeDefined();
			})
	})

	test("GET /:id", async () => {
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
		return agent.get(`/api/exercises/${exercise._id.toString()}`)
			.set('Accept', 'application/json')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body._id).toMatch(exercise._id.toString());
				expect(res.body.body.title).toMatch(exercise.title);
				expect(res.body.body.description).toMatch(exercise.description);
				expect(res.body.body.creator).toBeUndefined();
				expect(res.body.body.lastEditor).toBeUndefined();
				expect(res.body.body.bodyPart.name).toMatch(part.name);
				expect(res.body.body.bodyPart.description).toMatch(part.description);
				expect(res.body.body.bodyPart._id).toMatch(part._id.toString());
				expect(res.body.body.video.key).toMatch(exercise.video.key);
				expect(res.body.body.image.key).toMatch(exercise.image.key);
				expect(res.body.body.audio.key).toMatch(exercise.audio.key);
				expect(res.body.body.thumbImage.key).toMatch(exercise.thumbImage.key);
			});
	})

	test("GET /", async () => {
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

		const expectedCount = 15;
		const exercises = [];

		for (let i = 0; i < expectedCount; i++) {
			new_exercise.title = new_exercise.title + i;
			new_exercise.description = new_exercise.description + i;
			new_exercise.video.key = new_exercise.video.key + i;
			new_exercise.image.key = new_exercise.image.key + i;
			new_exercise.audio.key = new_exercise.audio.key + i;
			new_exercise.thumbImage.key = new_exercise.thumbImage.key + i;

			const exercise = await exerciseService.create(new_exercise);
			exercises.push(exercise);
		}

		return agent.get('/api/exercises/')
			.set('Accept', 'application/json')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.length).toBe(expectedCount);
				for (let i = 0; i < expectedCount; i++) {
					expect(res.body.body[i]._id).toMatch(exercises[i]._id.toString());
					expect(res.body.body[i].title).toMatch(exercises[i].title);
					expect(res.body.body[i].description).toMatch(exercises[i].description);
					expect(res.body.body[i].creator).toBeUndefined();
					expect(res.body.body[i].lastEditor).toBeUndefined();
					expect(res.body.body[i].bodyPart.name).toMatch(part.name);
					expect(res.body.body[i].bodyPart.description).toMatch(part.description);
					expect(res.body.body[i].bodyPart._id).toMatch(part._id.toString());
					expect(res.body.body[i].video.key).toMatch(exercises[i].video.key);
					expect(res.body.body[i].image.key).toMatch(exercises[i].image.key);
					expect(res.body.body[i].audio.key).toMatch(exercises[i].audio.key);
					expect(res.body.body[i].thumbImage.key).toMatch(exercises[i].thumbImage.key);
				}
			});
	})

	test("GET /paginate", async () => {
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
		const limit = 5;
		const expectedCount = limit + 2;
		const exercises = [];

		for (let i = 0; i < expectedCount; i++) {
			new_exercise.title = new_exercise.title + i;
			new_exercise.description = new_exercise.description + i;
			new_exercise.video.key = new_exercise.video.key + i;
			new_exercise.image.key = new_exercise.image.key + i;
			new_exercise.audio.key = new_exercise.audio.key + i;
			new_exercise.thumbImage.key = new_exercise.thumbImage.key + i;

			const exercise = await exerciseService.create(new_exercise);
			exercises.push(exercise);
		}


		let j = 0;
		let page = 0;
		let res = await agent.get(`/api/exercises/paginate?page=${page++}&limit=${limit}`)
			.set('Accept', 'application/json')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200);

		expect(res.body.body.length).toBe(limit);
		for (let i = 0; i < res.body.body.length; i++, j++) {
			expect(res.body.body[i]._id).toMatch(exercises[j]._id.toString());
			expect(res.body.body[i].title).toMatch(exercises[j].title);
			expect(res.body.body[i].description).toMatch(exercises[j].description);
			expect(res.body.body[i].creator).toBeUndefined();
			expect(res.body.body[i].lastEditor).toBeUndefined();
			expect(res.body.body[i].bodyPart.name).toMatch(part.name);
			expect(res.body.body[i].bodyPart.description).toMatch(part.description);
			expect(res.body.body[i].bodyPart._id).toMatch(part._id.toString());
			expect(res.body.body[i].video.key).toMatch(exercises[j].video.key);
			expect(res.body.body[i].image.key).toMatch(exercises[j].image.key);
			expect(res.body.body[i].audio.key).toMatch(exercises[j].audio.key);
			expect(res.body.body[i].thumbImage.key).toMatch(exercises[j].thumbImage.key);
		}
		res = await agent.get(`/api/exercises/paginate?page=${page}&limit=${limit}`)
			.set('Accept', 'application/json')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200);
		expect(res.body.body.length).toBe(expectedCount - limit);
		for (let i = 0; i < res.body.body.length; i++, j++) {
			expect(res.body.body[i]._id).toMatch(exercises[j]._id.toString());
			expect(res.body.body[i].title).toMatch(exercises[j].title);
		}

	});

	test("PUT /:id", async () => {
		let temp = {
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
		temp = {
			name: "part2",
			description: "desc3"
		}

		const part1 = await bodyPartService.create(temp);
		const expectedUpdate = {
			title: "Test",
			description: "This description",
			bodyPart: part1._id,
		}

		return agent.put(`/api/exercises/${exercise._id.toString()}`)
			.send(expectedUpdate)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body._id).toMatch(exercise._id.toString());
				expect(res.body.body.title).toMatch(expectedUpdate.title);
				expect(res.body.body.description).toMatch(expectedUpdate.description);
				expect(res.body.body.creator).toBeUndefined();
				expect(res.body.body.lastEditor).toBeUndefined();
				expect(res.body.body.bodyPart).toMatch(part1._id.toString());
			});
	})

	test("GET /count", async () => {
		const temp = {
			name: "part1",
			description: "desc"
		}

		const part = await bodyPartService.create(temp);

		const new_exercise = {
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
			},
			title: "This is a title",
			description: "This is a test",
			bodyPart: part._id,
			creator: {
				userRole: env.ADMIN_ROLE,
				admin: admin._id
			},
			lastEditor: {
				userRole: env.ADMIN_ROLE,
				admin: admin._id
			}
		}

		const expectedCount = 5;
		for (let i = 0; i < expectedCount; i++) {
			await exerciseService.create(new_exercise);
		}

		return agent.get('/api/exercises/count')
			.set('Accept', 'application/json')
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(res => {
				expect(res.body.body.count).toBe(expectedCount);
			});
	})

	test("DELETE /:id", async () => {
		const temp = {
			name: "part1",
			description: "desc"
		}

		const part = await bodyPartService.create(temp);

		const new_exercise = {
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
			},
			title: "This is a title",
			description: "This is a test",
			bodyPart: part._id,
			creator: {
				userRole: env.ADMIN_ROLE,
				admin: admin._id
			},
			lastEditor: {
				userRole: env.ADMIN_ROLE,
				admin: admin._id
			}
		}

		const exercise = await exerciseService.create(new_exercise);

		return agent.delete(`/api/exercises/${exercise._id.toString()}`)
			.set('Auth-Token', admin_token)
			.set('Accept', 'application/json')
			.expect(200)
			.then(async res => {
				const deletedCount = 1;
				expect(res.body.body.deleted).toBe(deletedCount);
				const deleteExercise = await exerciseService.getOne(exercise._id.toString());
				expect(deleteExercise).toBeNull();
			});

	})
})