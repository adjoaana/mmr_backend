const AdminMiddleware = require('../middlewares/Admin.middleware');
const AdminService = require('../services/Admin.service');
const AuthenticationManager = require('../utils/Authentication.manager');
const Controller = require('./Controller');
const { body } = require('express-validator');
class AdminController extends Controller{
	constructor() {
		super(new AdminService(), "admins route");
	}
	add = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		res.body.photo = {
			key: res.body.name + Date.now()
		}
		return super.add(req, res);
	}
	updateOne = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const id = req.params.id;
			if (!id) {
				return this.respondParamsError(res);
			}
			const body = req.body;
			// Prevent email and password update.
			delete body.password;
			delete body.email;

			const response = await this.service.updateOne(id, body);
			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			this.respondServerError(res);
		}

	}

	updateAdmin = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const { name, gender } = req.body;
			const user_id = req.req_user._id
			await this.service.updateOne(user_id, { name, gender });
			return res.status(200).json({
				status: 200,
				body: {
					name,
				},
				msg: "Admin updated successful.",
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			this.respondServerError(res);
		}
	}
	getCurrentAdminInfo = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.req_user._id
			const response = await this.service.getOne(user_id);
			console.log({response})
			return res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	changePassword = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const { password, new_password } = req.body;
			const user_id = req.req_user._id
			const email = req.req_user.email
			if (await this.service.verifyUserPassword(email, password)) {
				await this.service.updateOne(user_id, { password: AuthenticationManager.hashPassword(new_password) });
				return res.status(200).json({
					status: 200,
					msg: "Admin password changed successful.",
					route: this.routeString
				});
			} else {
				return res.status(400).json({
					status: 400,
					msg: "Wrong password provided.",
					route: this.routeString
				});
			}
		} catch (err) {
			console.log(err);
			this.respondServerError(res);
		}
	}

	resetPasswordRequest = async (req, res) => {
		try {
			if (this.respondValidationError(req, res))
				return;
			const { email } = req.body;
			const data = {
				passwordResetToken: {
					code: AuthenticationManager.generatePasswordResetToken(),
					expirationTimestamp: Date.now() + 3600000 //Expires after an hour.
				}
			}
			const response = await this.service.updateByEmail(email, data);

			console.log({ response });
			if (response) {

				this.emailService.sendPasswordReset(email,)
				res.status(200).json({
					status: 200,
					success: true,
					message: "Reset instructions have been sent to your email.",
					route: this.routeString
				});
			} else {
				res.status(200).json({
					status: 400,
					success: false,
					message: "User does not exist.",
					route: this.routeString
				});
			}

		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	} 


	validate(method) {
		switch (method) {
			case 'update': {
				return AdminMiddleware.update_validate();
			}
		}
	}
	admin_update_validate = () => {
		return [
			body('name', 'name is required').exists(),
			body('gender', 'gender is required. values M|F').exists(),
		]
	}
	admin_change_password_validate = () => {
		return [
			body('password', 'password is required').exists(),
			body('new_password', 'new_password is required').exists(),
			body('new_password', 'new_password must be 8 characters or more').isLength({ min: 8 }),
		]
	}
}

module.exports = AdminController;