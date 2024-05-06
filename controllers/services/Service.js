class Service {
	constructor(model, selection = "", sort = "") {
		this.Model = model;
		this.selection = selection;
		this.sort = sort;
	}

	async create(data) {
		const result = new this.Model(data);
		let response = await result.save();
		response = response.toObject();
		const selections = this.selection.split(" ");
		for (const selection of selections) {
			if (selection[0] === "-")
				delete response[selection.substring(1)];
		}
		return response;
	}
	async add(data) {
		return this.create(data);
	}

	async getOne(_id) {
		const response = await this.Model.findOne({ _id }, this.selection).sort(this.sort);
		return response;
	}

	async getOneByFilter(filter) {
		const response = await this.Model.findOne(filter, this.selection).sort(this.sort);
		return response;
	}
	async getManyByFilter(filter, selection = this.selection) {
		const response = await this.Model.find(filter, selection).sort(this.sort);
		return response;
	}

	async getAll() {
		const response = await this.getManyByFilter({});
		return response;
	}

	async count(filter = {}) {
		const response = await this.Model.countDocuments(filter);
		return response;
	}

	async getPage(page, limit = 10) {
		if (page < 0 || limit < 0)
			return [];
		const response = await this.Model.find({}, this.selection).sort(this.sort).limit(limit).skip(limit * page);
		return response;
	}

	async getPageByFilter(filter, page, limit = 10) {
		if (page < 0 || limit < 0)
			return [];
		const response = await this.Model.find(filter, this.selection).sort(this.sort).limit(limit).skip(limit * page);
		return response;
	}

	async updateOne(_id, data) {
		const response = await this.Model.findOneAndUpdate({ _id }, data, { new: true, useFindAndModify: false, fields: this.selection }).sort(this.sort);
		return response;
	}
	async update(data) {
		const response = await this.Model.updateMany({}, data, { new: true, useFindAndModify: false, fields: this.selection }).sort(this.sort);
		return response;
	}
	async updateOneByFilter(filter, data) {
		const response = await this.Model.findOneAndUpdate(filter, data, { new: true, useFindAndModify: false, fields: this.selection }).sort(this.sort);
		return response;
	}

	async updateManyByFilter(filter, data) {
		const response = await this.Model.updateMany(filter, data);
		return response;
	}

	async deleteOne(_id) {
		const result = await this.Model.deleteOne({ _id });

		return result.deletedCount ?? 0;
	}
	async deleteOneByFilter(filter) {
		const result = await this.Model.deleteOne(filter);

		return result.deletedCount ?? 0;
	}
	async deleteAll(_id) {
		const result = await this.Model.deleteMany();

		return result.deletedCount ?? 0;
	}

	async deleteByFilter(filter) {
		const result = await this.Model.deleteMany(filter);

		return result.deletedCount ?? 0;
	}
}

module.exports = Service;