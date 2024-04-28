const { body } = require('express-validator');

class StorageMiddleware{
	static presignedUrl = () => {
		return [
			body('key', 'key must be a string').isString().trim(),
			body('fileType', 'fileType must be a string').isString().trim(),
		]
	}
}

module.exports = StorageMiddleware;