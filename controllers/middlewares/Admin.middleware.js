const { body } = require('express-validator');

class AdminMiddleware {
	static update_validate() {
		return [
			body('name', 'name is required').exists(),
			body('email', 'Invalid email').exists().isEmail(),
			body('password', 'Password is required').not.exists(),
			body('password', 'password must be 6 characters or more').isLength({ min: 6 })
		]
	}
}

module.exports = AdminMiddleware;