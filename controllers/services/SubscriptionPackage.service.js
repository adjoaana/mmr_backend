const Service = require('./Service');
const SubscriptionPackage = require("../models/SubscriptionPackage.model");

class SubscriptionPackageService extends Service {
	constructor() {
		super(SubscriptionPackage);
	};
}

module.exports = SubscriptionPackageService;