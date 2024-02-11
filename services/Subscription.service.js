const Service = require('./Service');
const Subscriptions = require("../models/Subscription.model");

class SubscriptionService extends Service {
	constructor() {
		super(Subscriptions, "", "-createdAt");
	};
	getOne = async (_id) => {
		const response = await this.Model.findOne({ _id }, this.selection)
			.populate("user", "name email")
			.populate("package", "title description price")
			.populate("payment", "paymentRef amount createdAt user currency")
			.sort(this.sort);
		return response;
	}
	getAll = async () => {
		const response = await this.Model.find({}, this.selection)
			.populate("user", "name email")
			.populate("package", "title description price")
			.populate("payment", "paymentRef amount createdAt user currency")
			.sort(this.sort);
		return response;
	}

	getOneByFilter = async (filter) => {
		const response = await this.Model.findOne(filter, this.selection)
			.populate("user", "name email")
			.populate("package", "title description price")
			.populate("payment", "paymentRef amount createdAt user currency")
			.sort(this.sort);
		return response;
	}

	getManyByFilter = async (filter) => {
		const response = await this.Model.find(filter, this.selection)
			.populate("user", "name email")
			.populate("package", "title description duration_text duration")
			.populate("payment", "paymentRef amount createdAt user currency")
			.sort(this.sort);
		return response;
	}

	getPage = async (page, limit = 10) => {
		if (page < 0 || limit < 0)
			return [];
		const response = await this.Model.find({}, this.selection)
			.populate("user", "name email")
			.populate("package", "title description price")
			.populate("payment", "paymentRef amount createdAt user currency")
			.sort(this.sort)
			.limit(limit)
			.skip(limit * page);
		return response;
	}

	getPageByFilter = async (filter, page, limit = 10) => {
		if (page < 0 || limit < 0)
			return [];
		const response = await this.Model.find(filter, this.selection)
			.populate("user", "name email")
			.populate("package", "title description price")
			.populate("payment", "paymentRef amount createdAt user currency")
			.sort(this.sort)
			.limit(limit)
			.skip(limit * page);
		return response;
	}
}

module.exports = SubscriptionService;