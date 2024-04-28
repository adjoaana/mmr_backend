const { body } = require('express-validator');
const HealthProfessionalTypeService = require('../services/HealthProfessionalType.service');
const UserService = require('../services/User.service');
const ExerciseService = require('../services/Exercise.service');
const mongoose = require('mongoose');
const config = require("../config");
require("dotenv").config();

class SessionMiddleware {
	static create = () => {
		return [
			body('type', 'type must be a string').exists().isAlpha(),
			body('timestamp', 'timestamp must be an integer').exists().isInt(),
			body('duration', 'duration must be an integer').optional().isInt(),
			body('type').custom(async (value) => {
				if (!["online", "physical"].includes(value)) {
					throw new Error('type is invalid. Type must be "online" or "physical"');
				}
			}),
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
			body('healthProfessional').custom(async (value) => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('healthProfessional is not a valid object Id');
				}
				const healthProfessional = await new UserService().getOneByFilter({ _id: value, role: config.HEALTH_PROFESSIONAL_ROLE });

				if (!healthProfessional) {
					throw new Error('healthProfessional does not exist');
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
			body('timestamp', 'Timestamp is required. Must be a number in second').exists().isNumeric()
		]
	}
	static addDiagnosis = () => {
		return [
			body('PC', 'PC (Presenting Complaint) must be a string').isString().trim(),
			body('HPC', 'HPC (History of Presenting Complaint) must be a string').isString().trim(),
			body('PMHx', 'PMHx (Past Medical History) must be a string').isString().trim(),
			body('FSHx', 'FSHx (Family and Social History) must be a string').isString().trim(),
			body('OE', 'OE (Observation and Examination) must be a string').isString().trim(),
			body('DHx', 'DHx (Drug History) must be a string').isString().trim(),
			body('investigation', 'investigation must be a string').isString().trim(),
			body('physicalDiagnosis', 'physicalDiagnosis must be a string').isString().trim(),
			body('plan', 'plan must not be empty').isString().trim(),
			body('note', 'note must not be empty').isString().trim(),
			body('recommendation', 'recommendation must not be empty').isString().trim(),
		]
	}

	static updateExerciseStatus = () => {
		return [
			body('status', 'status must not be empty').exists().trim().isIn(["added", "viewed", "completed"]),
			body('patientComment', 'patientComment must be a string').isString().trim(),
		]
	}
	static addExercises = () => {
		return [
			body("", 'Exercises must be an array').isArray({ min: 0 }),
			body('*.exercise', 'Exercise ID is required in object').custom(async value => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error(`Exercise ${value} is not a valid object Id`);
				}
				const exercise = await new ExerciseService().getOne(value);

				if (!exercise) {
					throw new Error(`Exercise ${value} does not exist`);
				}
				return true;
			}),
			body('*.sets', 'Set must be an integer').optional().isInt(),
			body('*.reps', 'Reps must be an integer').optional().isInt(),
			body('*.time', 'Time must be a number').optional().isNumeric(),
			body('*.distance', 'Distance must be a number').optional().isNumeric(),
			body('*.intensity', 'Intensity must be a string').optional().isString().trim(),
			body('*.note', 'Note must be a string').optional().isString().trim(),
		]
	}
	static addExercise = () => {
		return [
			body('exercise').custom(async value => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error(`Exercise ${value} is not a valid object Id`);
				}
				const exercise = await new ExerciseService().getOne(value.exercise);

				if (!exercise) {
					throw new Error(`Exercise ${value} does not exist`);
				}
				return true;
			}),
			body('sets', 'Set must be an integer').optional().isInt(),
			body('reps', 'Reps must be an integer').optional().isInt(),
			body('time', 'Time must be a number').optional().isNumeric(),
			body('distance', 'Distance must be a number').optional().isNumeric(),
			body('intensity', 'Intensity must be a string').optional().isString().trim(),
			body('note', 'Note must be a string').optional().isString().trim(),

		]
	}
	static createUserSession = () => {
		return [
			body('type', 'type must be a string').exists().isAlpha().trim(),
			body('timestamp', 'timestamp must be an integer').exists().isInt(),
			body('duration', 'duration must be an integer').optional().isInt(),
			body('type').custom(async (value) => {
				if (!["online", "physical"].includes(value)) {
					throw new Error('type is invalid. Type must be "online" or "physical"');
				}
				return true;
			}),
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
}

module.exports = SessionMiddleware;