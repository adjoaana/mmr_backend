const AuthenticationController = require("../controllers/Authentication.controller");
const SettingsService = require("../services/Settings.service");

class InstallationManager {
	static async initializeSetup() {
		const settingService = new SettingsService();
		const result = await settingService.getAll();
		if (result.length === 0) {
			settingService.create({
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
			})
			console.log("settings setup completed");
			new AuthenticationController("admin").firstUserSetup();
			
		} else {
			console.log("Not first setup.");
		}


	}
}

module.exports = InstallationManager;