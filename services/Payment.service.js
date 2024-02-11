const Service = require('./Service');
const Payments = require("../models/Payment.model");
const SettingsManger = require('../utils/Settings.manager');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

class PaymentService extends Service {
	constructor() {
		super(Payments);
	};

	getOne = async (_id) => {
		const response = await this.Model.findOne({ _id }, this.selection)
			.populate("user", "name email role")
			.sort(this.sort);
		return response;
	}
	getAll = async () => {
		const response = await this.Model.find({}, this.selection)
			.populate("user", "name email role")
			.sort(this.sort);
		return response;
	}

	getOneByFilter = async (filter) => {
		const response = await this.Model.findOne(filter, this.selection)
			.populate("user", "name email role")
			.sort(this.sort);
		return response;
	}

	getManyByFilter = async (filter) => {
		const response = await this.Model.find(filter, this.selection)
			.populate("user", "name email role")
			.sort(this.sort);
		return response;
	}
	getPage = async (page, limit = 10) => {
		if (page < 0 || limit < 0)
			return [];
		const response = await this.Model.find({}, this.selection)
			.populate("user", "name email role")
			.sort(this.sort)
			.limit(limit)
			.skip(limit * page);
		return response;
	}

	getPageByFilter = async (filter, page, limit = 10) => {
		if (page < 0 || limit < 0)
			return [];
		const response = await this.Model.find(filter, this.selection)
			.populate("user", "name email role")
			.sort(this.sort)
			.limit(limit)
			.skip(limit * page);
		return response;
	}

	generatePaystackPaymentUrl = async ({ user, amount, currency, extra }) => {
		const payment_secret = await SettingsManger.getPaystackSecretKey();
		const body = {
			email: user.email,
			amount: amount * 100,
			currency,
			metadata: extra
		}
		try {
			let response = await fetch('https://api.paystack.co/transaction/initialize', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${payment_secret}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body),
			});
			response = await response.json();
			return response.data;
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	getPaystackPayment = async (reference) => {
		const payment_secret = await SettingsManger.getPaystackSecretKey();
		try {

			let response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${payment_secret}`,
					'Content-Type': 'application/json'
				},
			});
			response = await response.json();
			return response?.data ?? null;
		} catch (error) {
			console.log(error);
			return null;
		}
	}
}

module.exports = PaymentService;