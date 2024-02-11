const { body } = require('express-validator');
const UserService = require('../services/User.service');
const SubscriptionPackageService = require('../services/SubscriptionPackage.service');
const PaymentService = require('../services/Payment.service');
const mongoose = require('mongoose');
require("dotenv").config();

class SubscriptionMiddleware {
	static create = () => {
		return [
			body('startTimestamp', 'startTimestamp must be a number').exists().isInt(),
			body('endTimestamp', 'endTimestamp must be a number').exists().isInt(),
			body('user').custom(async (value) => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('user is not a valid object Id');
				}
				const user = await new UserService().getOneByFilter({ _id: value });

				if (!user) {
					throw new Error('user does not exist');
				}

				return true;
			}),
			body('package').custom(async (value) => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('package is not a valid object Id');
				}
				const input_package = await new SubscriptionPackageService().getOneByFilter({ _id: value });

				if (!input_package) {
					throw new Error('subscription package does not exist');
				}

				return true;
			}),
			body('payment').custom(async (value) => {
				if (value) {
					if (!mongoose.Types.ObjectId.isValid(value)) {
						throw new Error('Payment is not a valid object Id');
					}
					const user = await new PaymentService().getOneByFilter({ _id: value });

					if (!user) {
						throw new Error('Payment does not exist');
					}
				}
				return true;
			}),
		]
	}
}

module.exports = SubscriptionMiddleware;