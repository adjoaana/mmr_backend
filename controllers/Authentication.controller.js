const AdminService = require("../services/Admin.service");
const UserService = require("../services/User.service");
const Controller = require("./Controller");
const AuthenticationManager = require("../utils/Authentication.manager");

const EmailService = require("../services/Email.service");
const AuthenticationMiddleware = require("../middlewares/Authentication.middleware");
const { PHYSIO_ROLE } = require("../config");
const util = require("util");
class AuthenticationController extends Controller {
	constructor(type) {
		if (type === "user")
			super(new UserService(), "users route");
		else if (type === 'admin')
			super(new AdminService(), "admins route");
		else
			throw {
				message: 'type is required in constructor',
				type: "AuthenticationControllerConstructorError"
			};
		this.type = type;
		this.emailService = new EmailService();
	}
	firstUserSetup = async () => {
		try {
			const admins = this.service.getAll();
			if (admins.length === 0) {
				console.log("Admin accounts exist");
				return;
			}
			const body = {
				email: "nafiudanlawal@gmail.com", // SuperUser
				password: "admin@123",
				name: "Nafiu Lawal",
				role: "admin",
				phone: "0550080890"
			}
			await this.service.create(body);
			console.log("Created first admin user");
			return null;
		} catch (err) {
			if (err.code === 11000) {
				return
			} else {
				console.log(err);
				return null;
			}
		}
	}

	login = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const { email, password, remember = false } = req.body;
			if (await this.service.verifyUserPassword(email, password)) {
				const account = await this.service.getByEmail(email);
				const res_body = {
					name: account.name,
					email,
					preferences: account.preferences,
					_id: account._id,
					role: this.type === "admin" ? "admin" : account.role,
					onboarded: account.onboarded,
					status: account.status,
					creator: account.creator,
				}
				if(account.role === PHYSIO_ROLE){
					res_body.licenseVerified = account.healthProfessionalExtraData?.licensePicture?.status === "approved";
				}
				res.status(200).json({
					status: 200,
					token: AuthenticationManager.createToken(res_body, remember),
					msg: "Login successful.",
					route: this.routeString
				});
			} else {
				res.status(400).json({
					status: 400,
					msg: "Wrong login details.",
					route: this.routeString
				});
			}
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	updateUser = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const { name, phone, dob, gender } = req.body;
			const user_id = req.req_user._id
			await this.service.updateOne(user_id, { name, phone, dob, gender });
			res.status(200).json({
				status: 200,
				body: {
					name,
					phone,
				},
				msg: "User updated successful.",
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
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
				res.status(200).json({
					status: 200,
					msg: "User password changed successful.",
					route: this.routeString
				});
			} else {
				res.status(400).json({
					status: 400,
					msg: "Wrong password provided.",
					route: this.routeString
				});
			}
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	verifyPasswordToken = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const { token } = req.body;
			const response = await this.service.getOneByPasswordResetToken(token);
			if (response) {
				if (response.passwordResetToken.expirationTimestamp > Date.now()) {
					res.status(200).json({
						status: 200,
						success: true,
						message: "token is valid",
						route: this.routeString
					});
				}
				else {
					res.status(200).json({
						status: 200,
						success: false,
						message: "token is expired",
						route: this.routeString
					});
				}
			} else {
				res.status(400).json({
					status: 400,
					success: false,
					message: "invalid token provided",
					route: this.routeString
				});
			}

			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	resetPassword = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const { token, password } = req.body;
			const response = await this.service.getOneByPasswordResetToken(token);
			if (response) {
				if (response.passwordResetToken.expirationTimestamp > Date.now()) {
					await this.service.updateOne(response._id, { "passwordResetToken.code": "", "passwordResetToken.expirationTimestamp": Date.now() - 360000, password: AuthenticationManager.hashPassword(password) });
					res.status(200).json({
						status: 200,
						msg: "User password reset successful.",
						success: true,
						route: this.routeString
					});
				}
				else {
					res.status(200).json({
						status: 200,
						success: false,
						message: "token is expired",
						route: this.routeString
					});
				}
			} else {
				res.status(400).json({
					status: 400,
					success: false,
					message: "invalid token provided",
					route: this.routeString
				});
			}
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}
	resetPasswordRequest = async (req, res) => {
		try {
			if (this.respondValidationError(req, res))
				return;
			const { email } = req.body;

			const user = await this.service.getByEmail(email);

			if (!user) {
				return this.respondAccessDenied(res);
			}

			const data = {
				passwordResetToken: {
					code: AuthenticationManager.generatePasswordResetToken(),
					expirationTimestamp: Date.now() + 3600000 //Expires after an hour.
				}
			}
			const response = await this.service.updatePasswordTokenByEmail(email, data);
			if (response) {
				await this.emailService.sendPasswordReset({
					email,
					passwordResetToken: data.passwordResetToken.code,
					user: { name: user.name }
				})
				res.status(200).json({
					status: 200,
					success: true,
					message: "Instructions to reset your password have been sent to your email.",
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

			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	register = async (req, res) => {
		try {
			if (this.respondValidationError(req, res))
				return null;
			const { email, password, name, role, phone } = req.body;
			const photo = {
				key: `${name.split(" ")[0]}_${Date.now()}`
			}
			const verificationToken = AuthenticationManager.generatePasswordResetToken();
			const body = {
				email,
				password,
				name,
				role,
				photo,
				extra: {
					verificationToken,
					phone,
				}
			}
			if (role === PHYSIO_ROLE) {
				body.extra = {
					...body.extra,
					healthProfessionalExtraData: {
						licensePicture: {
							key: `${name}_license_${Date.now()}`
						}
					}
				}

			}

			const response = await this.service.create(body);

			await this.emailService.sendVerifyEmail(name, email, verificationToken)

			res.status(201).json({
				status: 201,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			if (err.code === 11000) {
				res.status(409).json({
					status: 409,
					msg: "Email already exists.",
					route: this.routeString
				});
				return null;
			}
			console.log(err);
			return this.respondServerError(res);
		}
	}

	verifyEmailToken = async (req, res) => {
		try {
			if (this.respondValidationError(req, res))
				return;

			const { token } = req.body;

			const response = await this.service.getOneByVerifyEmailToken(token);

			if (response?._id) {
				// Update status and generate new token to replace old
				await this.service.updateOne(response._id, { status: "verified", verificationToken: null });
				await this.emailService.sendWelcomeMessage(response.name, response.email)
				res.status(200).json({
					status: 200,
					msg: "Email verified.",
					success: true,
					route: this.routeString
				});
			}
			else {
				res.status(200).json({
					status: 200,
					success: false,
					message: "Email already verified.",
					route: this.routeString
				});
			}
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	addAdmin = async (req, res) => {
		try {
			if (this.respondValidationError(req, res))
				return;
			const { email, password, name, gender } = req.body;
			const photo = {
				key: `${name.split(" ")[0]}_${Date.now()}`
			}
			const response = await this.service.create({ email, password, name, gender, photo });

			res.status(201).json({
				status: 201,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			if (err.code === 11000) {
				res.status(409).json({
					status: 409,
					msg: "Email already exists.",
					route: this.routeString
				});
				return null;
			}
			console.log(err);
			return this.respondServerError(res);
		}
	}

	reset_password = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const { email } = req.body;
			const user = await this.service.getByEmail(email);

			if (!user) {
				return this.respondAccessDenied(res);
			}

			const code = AuthenticationManager.generatePasswordResetToken();
			const passwordResetToken = {
				code,
				expirationTimestamp: Date.now() + 3600000 * 12 // Expires after 12 hours.
			}

			// Send Email
			const result = await new EmailService().sendPasswordReset({ email, passwordResetToken: code, user: { name: user.name } });

			// save token
			if (result) {
				await this.service.updateOne(user._id, passwordResetToken);
				res.status(200).json({
					status: 200,
					msg: "Reset Email sent successfully",
					route: this.routeString
				});
				return null;
			} else {
				return this.respondServerError();
			}

		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	register_validate = () => {
		return this.type === "user" ? AuthenticationMiddleware.user_register_validate() : AuthenticationMiddleware.admin_register_validate();
	}
}

module.exports = AuthenticationController;