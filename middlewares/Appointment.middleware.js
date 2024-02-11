const { body } = require('express-validator');
const HealthProfessionalTypeService = require('../services/HealthProfessionalType.service');
const UserService = require('../services/User.service');
const mongoose = require('mongoose');
const config = require("../config");
require("dotenv").config();

class AppointmentMiddleware {
	static create() {
		return [
			body('patient').custom(async (value) => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('Patient is not a valid object Id');
				}
				const patient = await new UserService().getOneByFilter({ _id: value, role: config.PATIENT_ROLE });

				if (!patient) {
					throw new Error('Patient does not exist');
				}

				return true;
			}),
			body('healthProfessionalType').custom(async (value) => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('HealthProfessionalType is not a valid object Id');
				}
				const healthProfessionalType = await new HealthProfessionalTypeService().getOne(value);

				if (!healthProfessionalType) {
					throw new Error('HealthProfessionalType does not exist');
				}

				return true;
			}),
			body('timestamp', 'Timestamp is required. Must be a number in second').exists().isNumeric(),
		]
	}
	static create_user_appointment() {
		return [
			body('healthProfessionalType').custom(async (value) => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('HealthProfessionalType is not a valid object Id');
				}
				const healthProfessionalType = await new HealthProfessionalTypeService().getOne(value);

				if (!healthProfessionalType) {
					throw new Error('HealthProfessionalType does not exist');
				}

				return true;
			}),
			body('timestamp', 'Timestamp is required. Must be a number in second').exists().isNumeric(),
		]
	}

	static approval() {
		return [
			body('healthProfessional_id', 'healthProfessional_id is required').exists(),
			body('healthProfessional_id').exists().custom(async (value) => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('healthProfessional id provided is not a valid object Id');
				}
				const healthProfessional = await new UserService().getOneByFilter({ _id: value, role: config.HEALTH_PROFESSIONAL_ROLE });

				if (!healthProfessional) {
					throw new Error('Health Professional does not exist');
				}

				return true;
			}),
			body().isObject(),
		]
	}
}

module.exports = AppointmentMiddleware;