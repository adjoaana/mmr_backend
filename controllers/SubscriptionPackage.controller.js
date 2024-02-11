const SubscriptionPackageService = require('../services/SubscriptionPackage.service');
const Controller = require('./Controller');
class SubscriptionPackageController extends Controller {
	constructor() {
		super(new SubscriptionPackageService(), "Subscription package route");
	}

	getCurrentOfferings = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const response = await this.service.getManyByFilter({
				"disabled": false,
				"userType": req.req_user.role,
			});
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

module.exports = SubscriptionPackageController;