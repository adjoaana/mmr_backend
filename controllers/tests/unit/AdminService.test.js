const AdminService = require('../../services/Admin.service');
const db = require('../db');

let service = new AdminService();
beforeAll(async () => await db.connect());
beforeEach(async () => {
	await db.clear();
	service = new AdminService();
});

afterAll(async () => {
	const response = await db.close()
	return response;
});
describe("Unit Tests for admin Service", () => {
	test("test create admin with required input", async () => {
		const expected = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };

		const admin = await service.create(expected);

		expect(admin.email).toMatch(expected.email);
		expect(admin.name).toMatch(expected.name);
		expect(admin.password).toBeUndefined();
	});

	test("test create admin duplicate email", async () => {
		const new_admin1 = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };
		const new_admin2 = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester two", password: "my_pass" };

		await service.create(new_admin1);

		try {
			await service.create(new_admin2);
		} catch (err) {
			expect(err.code).toBe(11000);
		}
	});

	test("test get admin by email", async () => {
		const expected = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };

		await service.create(expected);
		const admin = await service.getByEmail(expected.email);
		expect(admin.email).toMatch(expected.email);
		expect(admin.name).toMatch(expected.name);
		expect(admin.password).toBeUndefined();
	});

	test("test get admin by _id", async () => {
		const new_admin = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };
		const saved_admin = await service.create(new_admin);

		const admin = await service.getOne(saved_admin._id);
		expect(admin._id.toString()).toMatch(saved_admin._id.toString());
		expect(admin.email).toMatch(saved_admin.email);
		expect(admin.name).toMatch(saved_admin.name);
		expect(admin.password).toBeUndefined();
	});

	test("test get all admins", async () => {
		const new_admin1 = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };
		const new_admin2 = { email: "test1@email.com", photo: { key: "photo-key" }, name: "tester two", password: "my_pass" };
		const new_admin3 = { email: "test2@email.com", photo: { key: "photo-key" }, name: "tester three", password: "my_pass" };

		const saved_admin1 = await service.create(new_admin1);
		const saved_admin2 = await service.create(new_admin2);
		const saved_admin3 = await service.create(new_admin3);

		const admins = await service.getAll();

		expect(admins.length).toBe(3);
		expect(admins[0]._id.toString()).toMatch(saved_admin1._id.toString());
		expect(admins[0].email).toMatch(saved_admin1.email);
		expect(admins[0].name).toMatch(saved_admin1.name);
		expect(admins[0].password).toBeUndefined();

		expect(admins[1]._id.toString()).toMatch(saved_admin2._id.toString());
		expect(admins[1].email).toMatch(saved_admin2.email);
		expect(admins[1].name).toMatch(saved_admin2.name);
		expect(admins[1].password).toBeUndefined();

		expect(admins[2]._id.toString()).toMatch(saved_admin3._id.toString());
		expect(admins[2].email).toMatch(saved_admin3.email);
		expect(admins[2].name).toMatch(saved_admin3.name);
		expect(admins[2].password).toBeUndefined();
	});

	test("test delete admin by email", async () => {
		const saved_admin = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };
		await service.create(saved_admin);

		let result = await service.getByEmail(saved_admin.email);

		expect(result.email).toEqual(saved_admin.email);

		result = await service.deleteByEmail(saved_admin.email);

		const expected = 1;

		expect(result).toBe(expected);

		result = await service.getByEmail(expected.email);

		expect(result).toBeNull()
	});

	test("test delete admin by _id", async () => {
		const saved_admin = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };
		const admin = await service.create(saved_admin);

		let result = await service.getOne(admin._id);

		expect(result.email).toEqual(saved_admin.email);

		result = await service.deleteOne(admin._id);

		const expected = 1;

		expect(result).toBe(expected);

		result = await service.getOne(admin._id);
		expect(result).toBeNull()
	});

	test("test update admin by _id", async () => {
		const saved_admin = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };
		const admin = await service.create(saved_admin);

		let result = await service.getOne(admin._id);

		expect(result.email).toEqual(saved_admin.email);
		expect(result.name).toEqual(saved_admin.name);

		const updateObj = { name: "test 2", email: "ter@reper.com" };

		await service.updateOne(admin._id, updateObj);

		result = await service.getByEmail(updateObj.email);

		expect(result.name).toBe(updateObj.name);
		expect(result.email).toBe(updateObj.email);
	});

	test("test update admin by email", async () => {
		const saved_admin = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };
		const admin = await service.create(saved_admin);

		let result = await service.getOne(admin._id);

		expect(result.email).toEqual(saved_admin.email);
		expect(result.name).toEqual(saved_admin.name);

		const updateObj = { name: "test 2", email: "ter@reper.com" };

		result = await service.updateByEmail(admin.email, updateObj);

		expect(result.name).toBe(updateObj.name);
		expect(result.email).toBe(updateObj.email);
	});

	test("test admin model transformations", async () => {
		const saved_admin = { email: "tEst@emaIl.com", photo: { key: "photo-key" }, name: "PesTer onE", password: "my_pass" };
		const admin = await service.create(saved_admin);

		const result = await service.getOne(admin._id);

		expect(result.email).toEqual(saved_admin.email.toLowerCase());
		expect(result.name).toEqual(saved_admin.name.toLowerCase());
	});

	test("test get admin pagination", async () => {
		const email_temp = "test";
		const saved_admin = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };
		for (let i = 1; i <= 30; i++) {
			saved_admin.email = `${email_temp}${i}@email.com`;
			await service.create(saved_admin);
		}

		const admins = await service.getAll();
		const expectedNumber = 30
		expect(admins.length).toBe(expectedNumber);

		const adminsPage0 = await service.getPage(0);
		const adminsPage1 = await service.getPage(1);
		const adminsPage2 = await service.getPage(2);
		const adminsPage3 = await service.getPage(3);

		const adminsOutBound = await service.getPage(-1);

		let expectedEmail = `${email_temp}1@email.com`;
		expect(adminsPage0[0].email).toMatch(expectedEmail);

		expectedEmail = `${email_temp}11@email.com`;
		expect(adminsPage1[0].email).toMatch(expectedEmail);

		expectedEmail = `${email_temp}21@email.com`;
		expect(adminsPage2[0].email).toMatch(expectedEmail);

		const expectedSize = 0
		expect(adminsPage3.length).toBe(expectedSize);

		expect(adminsOutBound.length).toBe(expectedSize);
	});

	test("test get admin pagination limit", async () => {
		const email_temp = "test";
		const saved_admin = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };
		for (let i = 1; i <= 30; i++) {
			saved_admin.email = `${email_temp}${i}@email.com`;
			await service.create(saved_admin);
		}

		const admins = await service.getAll();
		const expectedNumber = 30
		expect(admins.length).toBe(expectedNumber);

		const adminsPage1 = await service.getPage(1, 15);

		const expectSize = 15;

		expect(adminsPage1.length).toBe(expectSize);

	});
	test("test get returns no passwords", async () => {
		const new_admin1 = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass" };
		const new_admin2 = { email: "test1@email.com", photo: { key: "photo-key" }, name: "tester two", password: "my_pass" };
		const new_admin3 = { email: "test2@email.com", photo: { key: "photo-key" }, name: "tester three", password: "my_pass" };

		await service.create(new_admin1);
		await service.create(new_admin2);
		const saved_admin = await service.create(new_admin3);

		const admins = await service.getAll();

		expect(admins.length).toBe(3);
		expect(admins[0].password).toBeUndefined();
		expect(admins[1].password).toBeUndefined();
		expect(admins[2].password).toBeUndefined();

		let admin = await service.getOne(saved_admin._id);
		expect(admin.password).toBeUndefined();

		admin = await service.getByEmail(saved_admin.email);
		expect(admin.password).toBeUndefined();
	})

	test("test update admin returns no passwords", async () => {
		const saved_admin = { email: "test@email.com", photo: { key: "photo-key" }, name: "tester one", password: "my_pass", role: "ind" };
		const admin = await service.create(saved_admin);

		const updateObj = { phone: { dialCode: "+233", number: "550080890" } };

		await service.updateOne(admin._id, updateObj);

		const result = await service.getByEmail(admin.email);

		expect(result.password).toBeUndefined();
	});
})