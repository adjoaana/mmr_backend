const UserService = require('../../services/User.service');
const db = require('../db');
const env = require("../../config");

let service = null;
beforeAll(async () => await db.connect());
beforeEach(async () => {
	await db.clear();
	service = new UserService();
});
afterAll(async () => {
	const response = await db.close()
	return response;
});

describe("Unit Tests for User Service", () => {
	test("test create user with required input", async () => {
		const expected = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };

		const user = await service.create(expected);

		expect(user.email).toMatch(expected.email);
		expect(user.role).toMatch(expected.role);
		expect(user.name).toMatch(expected.name);
		expect(user.photo.key).toBeDefined();
		expect(user.password).toBeUndefined();
	});

	test("test create user duplicate email", async () => {
		const new_user1 = { email: "test@email.com", photo: {key: "photo-key"},name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		const new_user2 = { email: "test@email.com", photo: {key: "photo-key"},name: "tester two", password: "my_pass", role: env.PHYSIO_ROLE };

		await service.create(new_user1);

		try {
			await service.create(new_user2);
		} catch (err) {
			expect(err.code).toBe(11000);
		}
	});

	test("test get user by email", async () => {
		const expected = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };

		await service.create(expected);
		const user = await service.getByEmail(expected.email);
		expect(user.email).toMatch(expected.email);
		expect(user.role).toMatch(expected.role);
		expect(user.name).toMatch(expected.name);
		expect(user.password).toBeUndefined();
	});

	test("test get user by _id", async () => {
		const new_user = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		const saved_user = await service.create(new_user);

		const user = await service.getOne(saved_user._id);
		expect(user._id.toString()).toMatch(saved_user._id.toString());
		expect(user.email).toMatch(saved_user.email);
		expect(user.role).toMatch(saved_user.role);
		expect(user.name).toMatch(saved_user.name);
		expect(user.password).toBeUndefined();
	});

	test("test get all users", async () => {
		const new_user1 = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		const new_user2 = { email: "test1@email.com", photo: { key: "photo-key" }, name: "tester two", password: "my_pass", role: env.PHYSIO_ROLE };
		const new_user3 = { email: "test2@email.com", photo: { key: "photo-key" }, name: "tester three", password: "my_pass", role: env.ORG_ROLE };

		const saved_user1 = await service.create(new_user1);
		const saved_user2 = await service.create(new_user2);
		const saved_user3 = await service.create(new_user3);

		const users = await service.getAll();

		expect(users.length).toBe(3);
		expect(users[0]._id.toString()).toMatch(saved_user1._id.toString());
		expect(users[0].email).toMatch(saved_user1.email);
		expect(users[0].role).toMatch(saved_user1.role);
		expect(users[0].name).toMatch(saved_user1.name);
		expect(users[0].password).toBeUndefined();

		expect(users[1]._id.toString()).toMatch(saved_user2._id.toString());
		expect(users[1].email).toMatch(saved_user2.email);
		expect(users[1].role).toMatch(saved_user2.role);
		expect(users[1].name).toMatch(saved_user2.name);
		expect(users[1].password).toBeUndefined();

		expect(users[2]._id.toString()).toMatch(saved_user3._id.toString());
		expect(users[2].email).toMatch(saved_user3.email);
		expect(users[2].role).toMatch(saved_user3.role);
		expect(users[2].name).toMatch(saved_user3.name);
		expect(users[2].password).toBeUndefined();
	});

	test("test delete user by email", async () => {
		const saved_user = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		await service.create(saved_user);

		let result = await service.getByEmail(saved_user.email);

		expect(result.email).toEqual(saved_user.email);

		result = await service.deleteByEmail(saved_user.email);

		const expected = 1;

		expect(result).toBe(expected);

		result = await service.getByEmail(expected.email);

		expect(result).toBeNull()
	});

	test("test delete user by _id", async () => {
		const saved_user = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		const user = await service.create(saved_user);

		let result = await service.getOne(user._id);

		expect(result.email).toEqual(saved_user.email);

		result = await service.deleteOne(user._id);

		const expected = 1;

		expect(result).toBe(expected);

		result = await service.getOne(user._id);

		expect(result).toBeNull()
	});

	test("test update user by _id", async () => {
		const saved_user = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		const user = await service.create(saved_user);

		let result = await service.getOne(user._id);

		expect(result.email).toEqual(saved_user.email);
		expect(result.name).toEqual(saved_user.name);

		const updateObj = { phone: { dialCode: "+233", number: "550080890" } };

		await service.updateOne(user._id, updateObj);

		result = await service.getByEmail(user.email);

		expect(result.phone).not.toBeNull();
		expect(result.phone.dialCode).toBe(updateObj.phone.dialCode);
		expect(result.phone.number).toBe(updateObj.phone.number);
	});

	test("test update user by email", async () => {
		const saved_user = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		const user = await service.create(saved_user);


		expect(user.email).toEqual(saved_user.email);
		expect(user.name).toEqual(saved_user.name);

		let updateObj = { phone: { dialCode: "+233", number: "550080890" } };

		let result = await service.updateByEmail(user.email, updateObj);

		expect(result.phone).not.toBeNull();
		expect(result.phone.dialCode).toBe(updateObj.phone.dialCode);
		expect(result.phone.number).toBe(updateObj.phone.number);

		// Adding field not in model
		updateObj = { phone1: { dialCode: "+233", number: "550080890" } };
		result = await service.updateByEmail(user.email, updateObj);

		expect(result.phone1).not.toBeNull();
	});

	test("test get user pagination", async () => {
		const email_temp = "test";
		const saved_user = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		for (let i = 1; i <= 30; i++) {
			saved_user.email = `${email_temp}${i}@email.com`;
			await service.create(saved_user);
		}

		const users = await service.getAll();
		const expectedNumber = 30
		expect(users.length).toBe(expectedNumber);

		const usersPage0 = await service.getPage(0);
		const usersPage1 = await service.getPage(1);
		const usersPage2 = await service.getPage(2);
		const usersPage3 = await service.getPage(3);

		const usersOutBound = await service.getPage(-1);

		let expectedEmail = `${email_temp}1@email.com`;
		expect(usersPage0[0].email).toMatch(expectedEmail);

		expectedEmail = `${email_temp}11@email.com`;
		expect(usersPage1[0].email).toMatch(expectedEmail);

		expectedEmail = `${email_temp}21@email.com`;
		expect(usersPage2[0].email).toMatch(expectedEmail);

		const expectedSize = 0
		expect(usersPage3.length).toBe(expectedSize);

		expect(usersOutBound.length).toBe(expectedSize);
	});

	test("test get user pagination limit", async () => {
		const email_temp = "test";
		const saved_user = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		for (let i = 1; i <= 30; i++) {
			saved_user.email = `${email_temp}${i}@email.com`;
			await service.create(saved_user);
		}

		const users = await service.getAll();
		const expectedNumber = 30
		expect(users.length).toBe(expectedNumber);

		const usersPage1 = await service.getPage(1, 15);

		const expectSize = 15;

		expect(usersPage1.length).toBe(expectSize);

	});

	test("test get returns no passwords", async () => {
		const new_user1 = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		const new_user2 = { email: "test1@email.com", photo: { key: "photo-key" }, name: "tester two", password: "my_pass", role: env.PHYSIO_ROLE };
		const new_user3 = { email: "test2@email.com", photo: { key: "photo-key" }, name: "tester three", password: "my_pass", role: env.ORG_ROLE };

		await service.create(new_user1);
		await service.create(new_user2);
		const saved_user = await service.create(new_user3);

		const users = await service.getAll();

		expect(users.length).toBe(3);
		expect(users[0].password).toBeUndefined();
		expect(users[1].password).toBeUndefined();
		expect(users[2].password).toBeUndefined();

		let user = await service.getOne(saved_user._id);
		expect(user.password).toBeUndefined();

		user = await service.getByEmail(saved_user.email);
		expect(user.password).toBeUndefined();
	})

	test("test update user returns no passwords", async () => {
		const saved_user = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.PATIENT_ROLE };
		const user = await service.create(saved_user);

		const updateObj = { phone: { dialCode: "+233", number: "550080890" } };

		await service.updateOne(user._id, updateObj);

		const result = await service.getByEmail(user.email);

		expect(result.password).toBeUndefined();
	});

	test("test create user with org role", async () => {
		const expected = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.ORG_ROLE };

		const user = await service.create(expected);

		expect(user.email).toMatch(expected.email);
		expect(user.role).toMatch(expected.role);
		expect(user.name).toMatch(expected.name);
		expect(user.password).toBeUndefined();
	});

	test("test create user with health Professional role", async () => {
		const expected = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.HEALTH_PROFESSIONAL_ROLE };

		const user = await service.create(expected);

		expect(user.email).toMatch(expected.email);
		expect(user.role).toMatch(expected.role);
		expect(user.name).toMatch(expected.name);
		expect(user.password).toBeUndefined();
	});

	test("test create user with clinic role", async () => {
		const expected = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: env.HEALTH_FACILITY_ROLE };

		const user = await service.create(expected);

		expect(user.email).toMatch(expected.email);
		expect(user.role).toMatch(expected.role);
		expect(user.name).toMatch(expected.name);
		expect(user.password).toBeUndefined();
	});
})