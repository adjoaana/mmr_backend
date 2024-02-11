const { body } = require('express-validator');
const env = require("../config");
const crypto = require('node:crypto');

const mongoose = require('mongoose');
const AuthenticationManager = require('../utils/Authentication.manager');
const SettingsService = require("../services/Settings.service")
const HealthProfessionalTypeService = require('../services/HealthProfessionalType.service');

class AuthenticationMiddleware {
	static allowed_users(user_roles = []) {
		return (req, res, next) => {
			const req_user = AuthenticationManager.decodeToken(req.headers["auth-token"]);
			const user_role = req_user?.role ?? "";
			if (!user_roles.includes(user_role)) {
				return res.status(401).json({
					status: 401,
					message: "User unauthorized for this endpoint.",
					info: "Access denied"
				});
			}
			req.req_user = req_user;
			return next();
		}
	}
	static public_healthProfessional() {
		return (req, res, next) => {
			const req_user = AuthenticationManager.decodeToken(req.headers["auth-token"]);
			if (req_user.creator.type !== "public" && (req_user.role !== "org" || req_user.role !== "clinic")) {
				return res.status(401).json({
					status: 401,
					message: "User unauthorized for this endpoint.",
					info: "Access denied"
				});
			}
			req.req_user = req_user;
			return next();
		}
	}
	static isParentUser() {
		return (req, res, next) => {
			const req_user = AuthenticationManager.decodeToken(req.headers["auth-token"]);
			if (req_user.creator.type !== "public" && req_user.role !== env.ORG_ROLE && req_user.role !== env.HEALTH_FACILITY_ROLE) {
				return res.status(401).json({
					status: 401,
					message: "User unauthorized for this endpoint.",
					info: "Access denied"
				});
			}
			req.req_user = req_user;
			return next();
		}
	}

	static public_patient() {
		return (req, res, next) => {
			const req_user = AuthenticationManager.decodeToken(req.headers["auth-token"]);
			if (req_user.creator.type !== "public") {
				return res.status(401).json({
					status: 401,
					message: "User unauthorized for this endpoint.",
					info: "Access denied"
				});
			}
			req.req_user = req_user;
			return next();
		}
	}

	static paystack(){
		return async (req, res, next) => {
			const settings = await new SettingsService().get();
			const body = JSON.stringify(req.body);
			const hash = crypto.createHmac('sha512', settings.payment.paystack.PAYSTACK_SECRET).update(body).digest('hex');
			if (hash === req.headers['x-paystack-signature']){
				return next();
			}
			else{
				throw new Error("Access denied");
			}
		}
	}

	static reset_password_request_validate() {
		return [
			body('email', 'email is required').exists(),
			body('email', 'Invalid email provided').isEmail(),
		]
	}

	static verify_password_token_validate() {
		return [
			body("token", 'token is required').exists().trim(),
			body("token", 'invalid token provided').isAlphanumeric()
		]
	}

	static verify_email_token_validate() {
		return [
			body("token", 'token is required').exists().trim(),
			body("token", 'invalid token provided').isAlphanumeric()
		]
	}

	static reset_password_validate() {
		return [
			body("token", 'token is required').exists(),
			body("token", 'invalid token provided').isAlphanumeric(),
			body('password', 'password is required').exists(),
			body('confirmPassword', 'confirmPassword is required').exists(),
			body('password').custom(async (value) => {
				const response = AuthenticationManager.checkPasswordStrength(value);
				if (!response.status) {
					throw new Error(response.message);
				}
				return true;
			}),
			body().custom(async (value) => {
				if(value.password !== value.confirmPassword){
					throw new Error("passwords do not match");
				}
				return true;
			}),

		]
	}

	static admin_register_validate(){
		return [
			body('name', 'name is required').exists(),
			body('email', 'invalid email').exists().isEmail(),
			body('gender', 'gender is required').exists(),
			body('password', 'password is required').exists(),
			body('password').custom(async (value) => {
				const response = AuthenticationManager.checkPasswordStrength(value);
				if (!response.status) {
					throw new Error(`password: ${response.message}`);
				}

				return true;
			}),
		]
	}

	static user_register_validate(){
		return [
			body('name', 'name is required').exists(),
			body('email', 'Invalid email').exists().isEmail(),
			body('password', 'password is required').exists(),
			body('password').custom(async (value) => {
				const response = AuthenticationManager.checkPasswordStrength(value);
				if (!response.status) {
					throw new Error(`password: ${response.message}`);
				}
				return true;
			}),
			body('role', 'role is required').exists(),
			body('phone', "phone is required and must be an object").isObject(),
			body('phone.dialCode', "phone dialCode is required").exists(),
			body('phone.number', "phone number is required").exists(),
		]
	}

	static user_update_validate(){
		return [
			body('name', 'name is required').exists(),
			body('dob', 'dob is required').exists(),
			body('gender', 'gender is required').exists(),
			body('phone', "phone is required and must be an object").isObject(),
			body('phone.dialCode', "phone dialCode is required").exists(),
			body('phone.number', "phone number is required").exists(),
		]
	}
	static healthProfessionalExtra() {
		return [
			body('healthProfessionalType').custom(async (value) => {
				if(!value){
					throw new Error('healthProfessionalType is required');
				}
				if (!mongoose.Types.ObjectId.isValid(value)) {
					throw new Error('HealthProfessionalType is not a valid object Id');
				}
				const healthProfessionalType = await new HealthProfessionalTypeService().getOne(value);

				if (!healthProfessionalType) {
					throw new Error('HealthProfessionalType does not exist');
				}
				return true;
			}),
			body('licenseNumber', 'licenseNumber is required').exists(),
			body('bio', 'bio is required').exists(),
			body('address', 'address is required').exists(),
			body('workplace', "workplace is required and must be an object").exists(),
			body('yearStarted', "yearStarted must be a number").isNumeric().exists(),
		]
	}
	static user_change_password_validate(){
		return [
			body('password', 'password is required').exists(),
			body('new_password', 'new_password is required').exists(),
			body('new_password').custom(async (value) => {
				const response = AuthenticationManager.checkPasswordStrength(value);
				if (!response.status) {
					throw new Error(`new_password: ${response.message}`);
				}

				return true;
			}),
		]
	}

	static login_validate(){
		return [
			body('email', 'Please enter a valid email').trim().isEmail(),
			body('password', 'Password is required').exists()
		]
	}

}

module.exports = AuthenticationMiddleware;