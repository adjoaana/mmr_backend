const Service = require('./Service');
const Exercises = require("../models/Exercise.model");

class ExerciseService extends Service {
	constructor() {
		super(Exercises, "-lastEditor -creator");
	};

	getOne = async (_id) => {
		const response = await this.Model.findOne({ _id })
			.populate("bodyPart", "name description");
		return response;
	}

	getOneByFilter = async (filter) => {
		const response = await this.Model.findOne(filter, this.selection)
			.populate("bodyPart", "name description");
		return response;
	}
	getPage = async (page, limit = 10) => {
		if (page < 0 || limit < 0)
			return [];
		const response = await this.Model.find({}, this.selection)
			.populate("bodyPart", "name description")
			.sort(this.sort)
			.limit(limit)
			.skip(limit * page)
		return response;
	}
	async getPageByFilter(filter, page, limit = 10) {
		if (page < 0 || limit < 0)
			return [];

		const response = await this.Model.find(filter, this.selection)
			.populate("bodyPart", "name description")
			.sort(this.sort)
			.limit(limit)
			.skip(limit * page);
		return response;
	}
	getManyByFilter = async (filter) => {
		const response = await this.Model.find(filter, this.selection)
			.populate("bodyPart", "name description")
			.sort(this.sort);
		return response;
	}
}

module.exports = ExerciseService;