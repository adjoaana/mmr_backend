const { body, query, oneOf } = require('express-validator');
const mongoose = require('mongoose');
require("dotenv").config();
const BodyPartService = require('../services/BodyPart.service.js');

class ExerciseMiddleware {
	static create = () => {
		return [
			body('video', 'video file is required').exists().isObject(),
			body('audio', 'audio file is required').exists().isObject(),
			body('thumbImage', 'thumbImage file is required').exists().isObject(),
			body('image', 'image file is required').exists().isObject(),
			body('title', 'title must be a string').exists().isString(),
			body('description', 'description must be a string').exists().isString(),
			body('bodyPart').custom(async (value) => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('Body part is not a valid object Id');
				}
				const bodyPart = await new BodyPartService().getOne(value);

				if (!bodyPart) {
					throw new Error('Body part does not exist');
				}

				return true;
			}),
		]
	}
	static createPartText = () => {
		return [
			body('title', 'title must be a string').exists().isString(),
			body('description', 'description must be a string').exists().isString(),
			body('bodyPart').custom(async (value) => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('Body part is not a valid object Id');
				}
				const bodyPart = await new BodyPartService().getOne(value);

				if (!bodyPart) {
					throw new Error('Body part does not exist');
				}

				return true;
			}),
		]
	}

	static createPartImage = () => {
		return [
			body('thumbImage', 'thumbImage file is required').exists().isObject(),
			body('image', 'image file is required').exists().isObject(),
		]
	}

	static createPartAudio = () => {
		return [
			body('audio', 'audio file is required').exists().isObject(),
		]
	}

	static createPartVideo = () => {
		return [
			body('video', 'video file is required').exists().isObject(),
		]
	}

	static update = () => {
		return [
			body('video', 'video can not be changed').not().exists(),
			body('audio', 'audio can not be changed').not().exists(),
			body('thumbImage', 'thumbImage can not be changed').not().exists(),
			body('image', 'image can not be changed').not().exists(),
			body('title', 'title must be a string').exists().isString(),
			body('description', 'description must be a string').exists().isString(),
			body('bodyPart').custom(async (value) => {
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('Body part is not a valid object Id');
				}
				const bodyPart = await new BodyPartService().getOne(value);

				if (!bodyPart) {
					throw new Error('Body part does not exist');
				}

				return true;
			}),
		]
	}
	static paginate = () => {
		return [
			oneOf([query('page', 'page must be numeric').isNumeric(), query('page', 'page must be numeric').not().exists()]),
			oneOf([query('limit', 'limit must be numeric').isNumeric(), query('limit', 'limit must be numeric').not().exists()]),
			oneOf([query('bodyPart', 'bodyPart must be numeric').custom(async (value) => {
				if(String(value).toLowerCase() === "" || value === undefined){
					return true;
				}
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('Body part is not a valid object Id');
				}
				const bodyPart = await new BodyPartService().getOne(value);

				if (!bodyPart) {
					throw new Error('Body part does not exist');
				}

				return true;
			}),]),
			oneOf([query('query', 'query must be alphanumeric').isAlphanumeric(), query('query', 'query must be alphanumeric').isEmpty(), query('query', 'query must be alphanumeric').not().exists()]),
		]
	}
}
module.exports = ExerciseMiddleware;
