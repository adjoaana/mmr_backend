const { body } = require('express-validator');
const UserService = require('../services/User.service');
const SubscriptionPackageService = require('../services/SubscriptionPackage.service');

const mongoose = require('mongoose');
require("dotenv").config();

class PaymentMiddleware {
	static create = () => {
		return [
			body('paymentRef', 'description must be a string').exists(),
			body('amount', 'duration must be a number').exists().isInt(),
			body('currency', 'currency is required').exists(),
			body('user', 'user is required').exists(),
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
		]
	}

	static generatePaymentRequest = () => {
		return [
			body('subscriptionPackageId', 'subscriptionPackageId is required').exists(),
			body('subscriptionPackageId').custom(async (value) => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('subscriptionPackageId is not a valid object Id');
				}
				const subscriptionPackage = await new SubscriptionPackageService().getOneByFilter({ _id: value });

				if (!subscriptionPackage) {
					throw new Error('subscriptionPackage does not exist');
				}

				if (subscriptionPackage.disabled) {
					throw new Error('subscriptionPackage is no longer offered');
				}
				return true;
			}),
			async (req, res, next) => {
				const subscriptionPackage = await new SubscriptionPackageService().getOneByFilter({ _id: req.body.subscriptionPackageId });
				req.subscriptionPackage = subscriptionPackage
				return next();
			}
		]
	}
}

module.exports = PaymentMiddleware;