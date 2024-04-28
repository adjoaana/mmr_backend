const mongoose = require('mongoose');
const Service = require('../../services/Service');
const db = require('../db');

let service = null;
let Tester = null;
beforeAll(async () => {
	await db.connect()
	const Schema = new mongoose.Schema({
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true
		},

		seed: {
			type: Number,
			description: "must be a number if the field exists."
		},
		gender: {
			type: String,
			description: "must be a character if the field exists"
		}
	},
		{ timestamps: true });

	Tester = mongoose.model('Tester', Schema);
});

beforeEach(async () => {
	await db.clear();

	service = new Service(Tester);
});
afterAll(async () => {
	const response = await db.close()
	return response;
});

describe("Unit Tests for Service", () => {
	test("test create method", async () => {
		const testerData = { name: "test", email: "test@test.com", seed: 15, gender: "boy" };

		const tester = await service.create(testerData);

		expect(tester.name).toMatch(testerData.name);
		expect(tester.email).toMatch(testerData.email);
		expect(tester.seed).toBe(testerData.seed);
		expect(tester.gender).toMatch(testerData.gender);

	});
	test("test updateOne method", async () => {
		const testerData = { name: "test", email: "test@test.com", seed: 15, gender: "boy" };

		const tester = await service.create(testerData);
		testerData.name = "Halii";
		testerData.email = "jer@red.com";
		testerData.seed = 599;
		testerData.gender = "other";

		const updatedTester = await service.updateOne(tester._id, testerData);

		expect(updatedTester.name).toMatch(testerData.name);
		expect(updatedTester.email).toMatch(testerData.email);
		expect(updatedTester.seed).toBe(testerData.seed);
		expect(updatedTester.gender).toMatch(testerData.gender);

	});

	test("test updateOne method", async () => {
		const testerData = { name: "test", email: "test@test.com", seed: 15, gender: "boy" };

		await service.create(testerData);
		const old_email = testerData.email;
		testerData.name = "Halii";
		testerData.email = "jer@red.com";
		testerData.seed = 599;
		testerData.gender = "other";

		const updatedTester = await service.updateOneByFilter({ email: old_email }, testerData);
		expect(updatedTester.name).toMatch(testerData.name);
		expect(updatedTester.email).toMatch(testerData.email);
		expect(updatedTester.seed).toBe(testerData.seed);
		expect(updatedTester.gender).toMatch(testerData.gender);

	});

	test("test add method", async () => {
		const testerData = { name: "test", email: "test@test.com", seed: 15, gender: "boy" };

		const tester = await service.add(testerData);

		expect(tester.name).toMatch(testerData.name);
		expect(tester.email).toMatch(testerData.email);
		expect(tester.seed).toBe(testerData.seed);
		expect(tester.gender).toMatch(testerData.gender);

	});

	test("test getOne method", async () => {
		const testerData = { name: "test", email: "test@test.com", seed: 15, gender: "boy" };

		const tester = await service.create(testerData);

		const fetchedTester = await service.getOne(tester._id);

		expect(fetchedTester.name).toMatch(testerData.name);
		expect(fetchedTester.email).toMatch(testerData.email);
		expect(fetchedTester.seed).toBe(testerData.seed);
		expect(fetchedTester.gender).toMatch(testerData.gender);

	});

	test("test getOneByFilter method", async () => {
		const testerData = { name: "test", email: "test@test.com", seed: 15, gender: "boy" };

		await service.create(testerData);

		const fetchedTester = await service.getOneByFilter({ email: testerData.email });

		expect(fetchedTester.name).toMatch(testerData.name);
		expect(fetchedTester.email).toMatch(testerData.email);
		expect(fetchedTester.seed).toBe(testerData.seed);
		expect(fetchedTester.gender).toMatch(testerData.gender);

	});
	test("test count method with filter", async () => {
		const kountExpected = 5;
		const tester = { name: "test", email: "test@test.com", seed: 15, gender: "boyGirl" };
		for (let i = 0; i < kountExpected; i++) {
			tester.name = `Tester${i}`;
			tester.email = `test@test.com${i}`;
			tester.seed = Number(i);
			await service.create(tester);
		}

		for (let i = kountExpected; i < kountExpected * 2; i++) {
			tester.name = `Tester${i}`;
			tester.email = `test@test.com${i}`;
			tester.seed = + 50;
			await service.create(tester);
		}

		const fetchedTesters = await service.count({ seed: tester.seed }); // seed is 50

		expect(fetchedTesters).toBe(kountExpected);
	});
	test("test count method without filter", async () => {
		const kountExpected = 10;
		const tester = { name: "test", email: "test@test.com", seed: 15, gender: "boyGirl" };
		for (let i = 0; i < kountExpected; i++) {
			tester.name = `Tester${i}`;
			tester.email = `test@test.com${i}`;
			tester.seed = Number(i);
			await service.create(tester);
		}
		const count = await service.count();
		expect(count).toBe(kountExpected);
	});

	test("test getManyByFilter method", async () => {
		const kountExpected = 5;
		const tester = { name: "test", email: "test@test.com", seed: 15, gender: "boyGirl" };
		for (let i = 0; i < kountExpected; i++) {
			tester.name = `Tester${i}`;
			tester.email = `test@test.com${i}`;
			tester.seed = i;
			await service.create(tester);
		}
		expectedSeed = 50;
		for (let i = kountExpected; i < kountExpected * 2; i++) {
			tester.name = `Tester${i}`;
			tester.email = `test@test.com${i}`;
			tester.seed = expectedSeed;
			await service.create(tester);
		}
		
		const fetchedTesters = await service.getManyByFilter({ seed: expectedSeed });
		expect(fetchedTesters.length).toBe(kountExpected);
		for (let i = 0, j = kountExpected; i < kountExpected; i++, j++) {
			const testerData = {
				name: `Tester${j}`,
				email: `test@test.com${j}`,
				seed: expectedSeed,
				gender: tester.gender
			};
			expect(fetchedTesters[i].name).toMatch(testerData.name);
			expect(fetchedTesters[i].email).toMatch(testerData.email);
			expect(fetchedTesters[i].seed).toBe(testerData.seed);
			expect(fetchedTesters[i].gender).toMatch(testerData.gender);
		}
	});

	test("test getAll method", async () => {
		const kountExpected = 5;
		const tester = { name: "test", email: "test@test.com", seed: 15, gender: "boyGirl" };
		for (let i = 0; i < kountExpected; i++) {
			tester.name = `Tester${i}`;
			tester.email = `test@test.com${i}`;
			await service.create(tester);
		}

		const fetchedTesters = await service.getAll();
		expect(fetchedTesters.length).toBe(kountExpected);
		for (let i = 0; i < kountExpected; i++) {
			const testerData = {
				...tester,
				name: `Tester${i}`,
				email: `test@test.com${i}`,
			};
			expect(fetchedTesters[i].name).toMatch(testerData.name);
			expect(fetchedTesters[i].email).toMatch(testerData.email);
			expect(fetchedTesters[i].seed).toBe(testerData.seed);
			expect(fetchedTesters[i].gender).toMatch(testerData.gender);
		}
	});

	test("test getPage without limit", async () => {
		const kountExpected = 30;
		const tester = { name: "test", email: "test@test.com", seed: 15, gender: "boyGirl" };
		for (let i = 0; i < kountExpected; i++) {
			tester.name = `Tester${i}`;
			tester.email = `test@test.com${i}`;
			await service.create(tester);
		}

		const fetchedTesters1 = await service.getPage(0);
		const expectSize = 10;

		expect(fetchedTesters1.length).toBe(expectSize);

		for (let j = 0; j < expectSize; j++) {
			const testerData = {
				...tester,
				name: `Tester${j}`,
				email: `test@test.com${j}`,
			};
			expect(fetchedTesters1.length).toBe(expectSize);
			expect(fetchedTesters1[j].name).toMatch(testerData.name);
			expect(fetchedTesters1[j].email).toMatch(testerData.email);
			expect(fetchedTesters1[j].seed).toBe(testerData.seed);
			expect(fetchedTesters1[j].gender).toMatch(testerData.gender);
		}
		const fetchedTesters2 = await service.getPage(1);
		expect(fetchedTesters2.length).toBe(expectSize);
		for (let i = expectSize, j = 0; i < expectSize * 2; i++, j++) {
			const testerData = {
				...tester,
				name: `Tester${i}`,
				email: `test@test.com${i}`,
			};
			expect(fetchedTesters2[j].name).toMatch(testerData.name);
			expect(fetchedTesters2[j].email).toMatch(testerData.email);
			expect(fetchedTesters2[j].seed).toBe(testerData.seed);
			expect(fetchedTesters2[j].gender).toMatch(testerData.gender);
		}


	});

	test("test delete method", async () => {
		const testerData = { name: "test", email: "test@test.com", seed: 15, gender: "boy" };

		const tester = await service.create(testerData);

		expect(tester.name).toMatch(testerData.name);
		expect(tester.email).toMatch(testerData.email);
		expect(tester.seed).toBe(testerData.seed);
		expect(tester.gender).toMatch(testerData.gender);


		const deleteData = await service.deleteOne(tester._id);
		const expectedCount = 1;
		expect(deleteData).toBe(expectedCount);

		const response = await service.getOne(tester._id);
		expect(response).toBeNull();
	});

	test("test deleteOneByFilter method", async () => {
		const testerData = { name: "test", email: "test@test.com", seed: 15, gender: "boy" };

		const tester = await service.create(testerData);

		expect(tester.name).toMatch(testerData.name);
		expect(tester.email).toMatch(testerData.email);
		expect(tester.seed).toBe(testerData.seed);
		expect(tester.gender).toMatch(testerData.gender);


		const deleteData = await service.deleteOneByFilter({ email: "test@test.com" });
		const expectedCount = 1;
		expect(deleteData).toBe(expectedCount);

		const response = await service.getOne(tester._id);
		expect(response).toBeNull();
	});

	test("test deleteByFilter method", async () => {
		const kountExpected = 5;
		const tester = { name: "test", email: "test@test.com", seed: 15, gender: "boyGirl" };
		for (let i = 0; i < kountExpected; i++) {
			tester.name = `Tester${i}`;
			tester.email = `test@test.com${i}`;
			tester.seed = 51;
			await service.create(tester);
		}

		for (let i = kountExpected; i < kountExpected * 2; i++) {
			tester.name = `Tester${i}`;
			tester.email = `test@test.com${i}`;
			tester.seed = 50;
			await service.create(tester);
		}
		const filter = { seed: 50 }
		let fetchedTesters = await service.getManyByFilter(filter); // seed is 50

		expect(fetchedTesters.length).toBe(kountExpected);

		await service.deleteByFilter(filter);
		fetchedTesters = await service.getManyByFilter(filter); // seed is 50

		expect(fetchedTesters.length).toBe(0);
	});
});