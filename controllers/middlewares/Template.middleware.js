const {body} = require('express-validator');
const HealthProfessionalTypeService = require("../services/HealthProfessionalType.service");
const UserService = require("../services/User.service");
const ExerciseService = require("../services/Exercise.service")
const mongoose = require('mongoose');
const config = require("../config");
require("dotenv").config();

class TemplateMiddleware {
    static create = () => {
        return [
            body('title', 'title must be a string').exists().isString(),
			body('description', 'description must be a string').exists().isString(),
            body('thumbImage', 'thumbImage file is required').exists().isObject(),
            body('timestamp', 'timestamp must be an integer').exists().isInt(),
            body("warmup", 'Exercises must be an array').isArray({ min: 0 }),
            body("main", 'Exercises must be an array').isArray({ min: 0 }),
            body("cooldown", 'Exercises must be an array').isArray({ min: 0 }),
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
            body('timestamp', 'Timestamp is required. Must be a number in second').exists().isNumeric(),
        ]
    }
    static createUserTemplate = () => {
        return [
            body('title', 'title must be a string').exists().isString(),
			body('description', 'description must be a string').exists().isString(),
            body('thumbImage', 'thumbImage file is required').exists().isObject(),
            body('timestamp', 'timestamp must be an integer').exists().isInt(),
            body("warmup", 'Exercises must be an array').isArray({ min: 0 }),
            body("main", 'Exercises must be an array').isArray({ min: 0 }),
            body("cooldown", 'Exercises must be an array').isArray({ min: 0 }),
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
    static addExercises = () => {
		return [
			body("warmup", 'Exercises must be an array').isArray({ min: 0 }),
			body("cooldown", 'Exercises must be an array').isArray({ min: 0 }),
			body("main", 'Exercises must be an array').isArray({ min: 0 }),
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
}
module.exports = TemplateMiddleware