const { body } = require('express-validator');
const config = require("../config");
require("dotenv").config();

class SubscriptionPackageMiddleware {
	static create = () => {
		return [
			body('title', 'title is required').exists(), 
			body('description', 'description is required').exists(),
			body('userType', 'userType is required').exists(),
			body('userType').custom(value => {
				const roles = [config.ORG_ROLE, config.PATIENT_ROLE, config.HEALTH_FACILITY_ROLE, config.HEALTH_PROFESSIONAL_ROLE];
				if (value && !roles.includes(value)) {
					throw new Error(`userType is invalid | Accepted userTypes: ${roles}`);
				}
				return true;
			}),
			body('duration', 'duration is required').exists(),
			body('duration', 'duration must be a number').isInt(),
			body('duration_text', 'description must be a string').exists(),
			body('price', 'price is required').exists(),
			body('price', 'price must be a number').isInt(),
			body('currency', 'currency is required').exists(),
		]
	}
}

module.exports = SubscriptionPackageMiddleware;