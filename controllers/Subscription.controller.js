const SubscriptionService = require('../services/Subscription.service');
const Controller = require('./Controller');
class SubscriptionController extends Controller {
	constructor() {
		super(new SubscriptionService(), "subscriptions route");
	}

	getUserSubscriptions = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.req_user._id
			const response = await this.service.getManyByFilter({user: user_id});
			return res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	getUserCurrentSubscriptions = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.req_user._id
			const response = await this.service.getManyByFilter({ user: user_id });
			return res.status(200).json({
				status: 200,
				body: response[0] ?? {},
				valid: response[0] ? true : false,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}
}

module.exports = SubscriptionController;