const User = require('../models/User.model');
const Service = require('./Service');

const UNVERIFIED = "unverified";

class UserService extends Service {
	constructor() {
		super(User, "-password -passwordResetToken -verificationToken");
	}
	create = async ({ name, email, password, role, photo, extra = {} }) => {
		const user = new User({
			...extra,
			email,
			password,
			role,
			name,
			photo,
		});
		let response = await user.save();
		response = response.toObject();
		const selections = this.selection.split(" ");
		for (const selection of selections) {
			if (selection[0] === "-")
				delete response[selection.substring(1)];
		}
		return response;
	}

	getHealthProfessionalExtraData = async (_id) => {
		const response = await this.Model.findOne({ _id }, this.selection)
			.sort(this.sort)
			.populate({
				path: 'healthProfessionalExtraData',
				populate: {
					path: 'healthProfessionalType',
					select: "name description"
				}
			})
		return response;
	}
	getByEmail = async (email) => {
		if (!email) {
			return null
		}
		const response = await this.getOneByFilter({ email: email.toLowerCase() });
		return response;
	}

	updateByEmail = async (email, data) => {
		if (!email) {
			return null
		}
		email = email.toLowerCase();
		const response = await User.findOneAndUpdate({ email }, data, { new: true, useFindAndModify: false, fields: this.selection });
		return response;
	}

	updatePasswordTokenByEmail = async (email, data) => {
		if (!email) {
			return null
		}
		email = email.toLowerCase();
		const response = await User.findOneAndUpdate({ email }, data, { new: true, useFindAndModify: false, fields: "passwordResetToken" });
		return response;
	}
	getOneByPasswordResetToken = async (token) => {
		if (!token) {
			return null
		}
		const response = await User.findOne({ "passwordResetToken.code": token }, "passwordResetToken name");
		return response;
	}

	getOneByVerifyEmailToken = async (verificationToken) => {
		if (!verificationToken) {
			return {}
		}
		const response = await User.findOne({ verificationToken }, "email name");
		return response;
	}

	async updateLicenseVerification(userId, verificationUpdate) {
		const response = await this.Model.findOneAndUpdate({
			_id: userId
		}, {
			$set: {
				"healthProfessionalExtraData.licensePicture.status": verificationUpdate
			}
		}, { new: true, fields: this.selection })
		return response;
	}

	async getPage(page, limit = 10, role = null) {
		if (page < 0 || limit < 0)
			return [];
		let filter = {};
		if (role)
			filter = { role };
		const response = await this.Model.find(filter, this.selection).sort(this.sort).limit(limit).skip(limit * page);
		return response;
	}
	deleteByEmail = async (email) => {
		if (!email) {
			return 0;
		}
		const result = await User.deleteOne({ email: email.toLowerCase() });
		return result.deletedCount;
	}

	verifyUserPassword = async (email, password) => {
		if (!email) {
			return false;
		}
		email = email.toLowerCase();
		const user = await User.findOne({ email });
		if (user)
			return user.isValidPassword(password);
		return false;
	}
}

module.exports = UserService;