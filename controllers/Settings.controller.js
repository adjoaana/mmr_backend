const SettingsService = require('../services/Settings.service');
const Controller = require('./Controller');
class SettingsController extends Controller {
	constructor() {
		super(new SettingsService(), "Settings route");
	}

	get = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const response = await this.service.getAll();
			res.status(200).json({
				status: 200,
				body: response[0],
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	getPaystackPaymentPublicKey = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const response = await this.service.getOneByFilter();
			res.status(200).json({
				status: 200,
				body: {
					public_key: response["payment"]["paystack"]["PAYSTACK_PUBLIC_KEY"]
				},
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	update = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const body = req.body;
			const response = await this.service.update(body);
			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}
}

module.exports = SettingsController;