const Service = require('./Service');
const Settings = require("../models/Settings.model");

class SettingsService extends Service {
	constructor() {
		super(Settings);
	};

	get = async () => {
		const result = await this.getAll();

		if (result.length > 0) {
			return result[0];
		}
		return {
			payment: {
				paystack: {
					PAYSTACK_SECRET: "",
					PAYSTACK_PUBLIC_KEY: ""
				}
			},
			email: {
				API_KEY: "",
				API_URL: "",
				SMTP_HOST: "",
				SMTP_PORT: 587,
				SMTP_USER: "",
				SMTP_PASS: ""
			}
		}
	}
}

module.exports = SettingsService;