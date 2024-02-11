const UserService = require('../services/User.service');
const EmailService = require('../services/Email.service');
const Controller = require('./Controller');
const config = require("../config");
const StorageManager = require('../utils/Storage.manager');
const AuthenticationManager = require('../utils/Authentication.manager');
const crypto = require('node:crypto');

require("dotenv").config();
class UserController extends Controller {
	constructor() {
		super(new UserService(), "users route");
		this.storageManager = new StorageManager();
		this.emailService = new EmailService();
	}

	completeHealthProfessionalOnboarding = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			if (req.req_user.role !== config.HEALTH_PROFESSIONAL_ROLE) {
				res.status(400).json({
					status: 400,
					msg: "User not authorized.",
					route: this.routeString
				});
			}
			await this.service.updateOne(req.req_user._id, { onboarded: true });

			res.status(200).json({
				status: 200,
				message: "User onboarded.",
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}
	getHealthProfessionalExtra = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const user_id = req.req_user._id
			let response = await this.service.getHealthProfessionalExtraData(user_id);
			response = {
				_id: response._id,
				name: response.name,
				...response.healthProfessionalExtraData
			}

			response.licensePicture.url = await this.storageManager.getFileUrl(response.licensePicture.key);

			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}
	updatehealthProfessionalExtra = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			if (req.req_user.role !== config.HEALTH_PROFESSIONAL_ROLE) {
				res.status(400).json({
					status: 400,
					msg: "User not authorized.",
					route: this.routeString
				});
			}
			const {
				healthProfessionalType,
				licenseNumber,
				bio,
				address,
				workplace,
				yearStarted
			} = req.body

			// Get 
			let response = await this.service.getHealthProfessionalExtraData(req.req_user._id);
			const healthProfessionalExtraData = {
				...response.healthProfessionalExtraData,
				healthProfessionalType,
				licenseNumber,
				bio,
				address,
				workplace,
				yearStarted,
			}
			response = await this.service.updateOne(req.req_user._id, { healthProfessionalExtraData });
			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}
	get = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		const { role } = req.query;
		try {
			let response = [];
			if (role)
				response = await this.service.getManyByFilter({ role });
			else
				response = await this.service.getAll();

			/* response = Promis.all(response.map(async item => {
				item.photo.url = await this.storageManager.getFileUrl(item.photo.key);
				return item
			})); */


			res.status(200).json({
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

	paginate = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			let { page, limit, role } = req.query;
			if (!page) {
				page = 0;
			}
			if (!limit) {
				limit = 10
			}

			let response = await this.service.getPage(page, limit, role);
			response = await Promise.all(response.map(async item => {
				item.photo.url = await this.storageManager.getFileUrl(item.photo.key);
				return item
			}));
			res.status(200).json({
				status: 200,
				pagination: {
					page,
					limit
				},
				body: response,
				help: "Add page and limit GET query params",
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

	userCreateUser = (req, res) => {
		const currentUserRole = req.req_user.role;
		if (currentUserRole === config.HEALTH_PROFESSIONAL_ROLE || currentUserRole === config.ORG_ROLE) {
			return this.createGroupUser(req, res, config.PATIENT_ROLE)
		} else if (currentUserRole === config.HEALTH_FACILITY_ROLE) {
			return this.createGroupUser(req, res, config.HEALTH_PROFESSIONAL_ROLE)
		} else {
			res.status(400).json({
				status: 400,
				msg: "Request Error.",
				route: this.routeString
			});
		}
	}

	updateUserProfilePicture = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const { photo } = req.body;
			const user_id = req.req_user._id
			await this.service.updateOne(user_id, { photo });
			res.status(200).json({
				status: 200,
				body: {
					photo,
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
	getUsers = async (req, res) => {
		console.log(req.req_user)
		if (req.req_user.creator.type === config.ADMIN_ROLE) {
			return this.getPublicUsers(req, res);
		}
		if ([config.ORG_ROLE, config.HEALTH_FACILITY_ROLE, config.HEALTH_PROFESSIONAL_ROLE].includes(req.req_user.role)) {
			return this.getGroupUsers(req, res);
		}

		return this.respondAccessDenied(res)
	}
	getPublicUsers = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			let response = await this.service.getManyByFilter({
				"creator.type": "public",
				role: config.PATIENT_ROLE
			});
			response = await Promise.all(response.map(async item => {
				item.photo.url = await this.storageManager.getFileUrl(item.photo.key);
				return item
			}));
			res.status(200).json({
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
	getGroupUsers = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			let response = await this.service.getManyByFilter({
				"creator.type": req.req_user.role,
				"creator.id": req.req_user._id,
			});
			response = await Promise.all(response.map(async item => {
				item.photo.url = await this.storageManager.getFileUrl(item.photo.key);
				return item
			}));
			res.status(200).json({
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

	createGroupUser = async (req, res, user_role) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const { email, name, phone } = req.body;

			// Generate random password
			const password = crypto.randomBytes(20).toString('hex');
			const role = user_role
			const status = "verified";
			const creator = {
				type: req.req_user.role,
				id: req.req_user._id
			}
			const code = AuthenticationManager.generatePasswordResetToken();
			const passwordResetToken = {
				code,
				expirationTimestamp: Date.now() + 3600000 * 12 // Expires after 12 hours.
			}
			const photo = {
				key: `${name.split(" ")[0]}_${Date.now()}`
			}

			const data = {
				email,
				name,
				password,
				role,
				photo,
				extra: {
					creator,
					status,
					passwordResetToken,
					phone
				}
			}
			if (role === config.PHYSIO_ROLE) {
				data.extra.healthProfessionalExtraData = {
					licensePicture: {
						key: `${Date.now()}_${req.req_user.name}_license`
					}
				}
			}

			const response = await this.service.create(data);
			const result = await this.emailService.sendPasswordReset({ email, passwordResetToken: code, user: { name } });
			await this.emailService.sendWelcomeMessage(name, email);
			const extraMessage = result ? "Password reset email sent successfully" : "Failed to sent password reset email";
			res.status(201).json({
				status: 201,
				body: response,
				msg: extraMessage,
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
				return
			}
			console.log(err);
			return this.respondServerError(res);
		}
	}

	createAdminUser = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const { email, name, role } = req.body;

			// Generate random password
			const password = crypto.randomBytes(20).toString('hex');

			const status = "verified";
			const creator = {
				type: "private",
				id: req.req_user._id
			}
			const code = AuthenticationManager.generatePasswordResetToken();
			const passwordResetToken = {
				code,
				expirationTimestamp: Date.now() + 3600000 * 12 // Expires after 12 hours.
			}
			const photo = {
				key: `${name.split(" ")[0]}_${Date.now()}`
			}

			const body = {
				email,
				name,
				password,
				role,
				photo,
				extra: {
					status,
					creator,
					passwordResetToken
				}
			}
			if (role === config.HEALTH_PROFESSIONAL_ROLE) {
				body.extra.creator = {
					type: "admin",
					id: req.req_user._id
				}
				body.extra.healthProfessionalExtraData = {
					licensePicture: {
						key: `${Date.now()}_${req.req_user.name}_license`
					}
				}
			}
			const response = await this.service.create(body);

			const result = await this.emailService.sendPasswordReset({ email, passwordResetToken: code, user: { name } });
			await this.emailService.sendWelcomeMessage(name, email);
			const extraMessage = result ? "Password reset email sent successfully" : "Failed to sent password reset email";
			res.status(201).json({
				status: 201,
				body: response,
				msg: extraMessage,
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
				return
			}
			console.log(err);
			return this.respondServerError(res);
		}
	}

	getCurrentUserInfo = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.req_user._id
			const response = await this.service.getOne(user_id);
			response.photo.url = await this.storageManager.getFileUrl(response.photo.key);
			
			if(response.role === config.HEALTH_PROFESSIONAL_ROLE ){
				response.healthProfessionalExtraData.licensePicture.url = await this.storageManager.getFileUrl(response.healthProfessionalExtraData.licensePicture.key);
			}

			res.status(200).json({
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

	getGroupUsersCount = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const response = await this.service.count({
				"creator.type": req.req_user.role,
				"creator.id": req.req_user._id,
			});
			res.status(200).json({
				status: 200,
				body: {
					count: response,
				},
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

	getPaginatedGroupUsers = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			let { page, limit } = req.query;
			if (!page) {
				page = 0;
			}
			if (!limit) {
				limit = 10
			}
			let response = await this.service.getPageByFilter({
				"creator.type": req.req_user.role,
				"creator.id": req.req_user._id,
			}, page, limit);
			response = response.map(item => {
				if (item.photo) {
					return {
						...item._doc,
						photo: config.HOST_FILE_URL + "api/file/" + item.photo.key,
					}
				}
				return item
			});
			res.status(200).json({
				status: 200,
				pagination: {
					page,
					limit: limit
				},
				body: response,
				help: "Add page and limit GET query params",
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

	getOneGroupUser = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const id = req.params.id;
			if (!id) {
				this.respondParamsError(res);
				return
			}
			let response = await this.service.getOneByFilter({
				"creator.type": req.req_user.role,
				"creator.id": req.req_user._id,
				_id: id,
			});
			if (response.photo) {
				response = {
					...response._doc,
					photo: config.HOST_FILE_URL + "api/file/" + response.photo.key,
				}
			}
			res.status(200).json({
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

	updateOneGroupUsers = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const id = req.params.id;
			if (!id) {
				this.respondParamsError(res);
				return
			}
			const {
				name,
				phone,
				dob,
				gender,
				address,
				preferences,
				status,
			} = req.body;
			const body = {
				name,
				phone,
				dob,
				gender,
				address,
				preferences,
				status,
			}

			const response = await this.service.updateOneByFilter(
				{
					"creator.type": req.req_user.role,
					"creator.id": req.req_user._id,
					_id: id,
				}, body
			);
			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	getUnapprovedHealthProfessionals = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			let response = await this.service.getManyByFilter({
				"healthProfessionalExtraData.licensePicture.status": "added",
				role: config.HEALTH_PROFESSIONAL_ROLE,
				onboarded: true,
			}, "name email photo healthProfessionalExtraData status");
			response = await Promise.all(response.map(async item => {
				item.photo.url = await this.storageManager.getFileUrl(item.photo.key);
				item.healthProfessionalExtraData.licensePicture.url = await this.storageManager.getFileUrl(item.healthProfessionalExtraData.licensePicture.key);
				return item
			}));
			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}
	addedLicense = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.req_user._id;	
			await this.service.updateLicenseVerification(user_id, "added");

			res.status(200).json({
				status: 200,
				message: "License uploaded.",
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}
	declineLicense = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.params.id;
			const { reason } = req.body;
			console.log({reason})
			const response = await this.service.updateLicenseVerification(user_id, "rejected");
			console.log({
				email: response.email,
				name: response.name,
				reason
			})
			await this.emailService.sendLicenseRejection({
				email: response.email,
				name: response.name,
				reason
			})

			res.status(200).json({
				status: 200,
				message: "User has been notified of your decision.",
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	approveLicense = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.params.id;
			const response = await this.service.updateLicenseVerification(user_id, "approved");
			await this.emailService.sendLicenseApproval({ email: response.email, name: response.name })
			res.status(200).json({
				status: 200,
				message: "License verified.",
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	updateOneAdminUsers = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const id = req.params.id;
			if (!id) {
				this.respondParamsError(res);
				return
			}
			const body = req.body;

			// Prevent email and password update.
			delete body.email;
			delete body.password;

			const response = await this.service.updateOne(id, body);
			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	deleteOneGroupUsers = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const id = req.params.id;
			if (!id) {
				this.respondParamsError(res);
				return
			}
			const body = req.body;
			const response = await this.service.deleteOneByFilter(
				{
					"creator.type": req.req_user.role,
					"creator.id": req.req_user._id,
					_id: id,
				}, body
			);
			res.status(200).json({
				status: 200,
				body: {
					deleted: response
				},
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}
}

module.exports = UserController;