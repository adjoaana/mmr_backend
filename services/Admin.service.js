const Admin = require('../models/Admin.model');
const Service = require('./Service');
class AdminService extends Service {
	constructor() {
		super(Admin, "-password");
	};
	async create({ name, email, password, photo }) {
		const admin = new this.Model({
			email,
			password,
			name,
			photo
		});
		let response = await admin.save();
		response = response.toObject();
		delete response["password"];
		return response;
	}

	async getByEmail(email) {
		if (!email)
			return null
		const response = await this.getOneByFilter({ email: email.toLowerCase() });
		return response;
	}

	async updateByEmail(email, data) {
		if (!email)
			return null
		email = email.toLowerCase();
		const response = await this.Model.findOneAndUpdate({ email }, data, { new: true, useFindAndModify: false, fields: this.selection });
		return response;
	}

	async deleteByEmail(email) {
		if (email) {
			email = email.toLowerCase();
			const result = await this.Model.deleteOne({ email });
			return result.deletedCount ?? 0;
		}
		return 0;
	}

	async verifyUserPassword(email, password) {
		if (!email) {
			return false;
		}
		email = email.toLowerCase();
		const admin = await this.Model.findOne({ email });
		if (admin)
			return admin.isValidPassword(password);
		return false;
	}
}

module.exports = AdminService;