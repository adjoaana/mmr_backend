const SettingsService = require('../services/Settings.service');
class SettingsManger{
	static async getPaystackSecretKey(){
		const settingsService = new SettingsService();
		const settings = await settingsService.getOneByFilter({});

		return settings.payment.paystack["PAYSTACK_SECRET"];
	}

	static async getPaystackPublicKey() {
		const settingsService = new SettingsService();
		const settings = await settingsService.getOneByFilter({});

		return settings.payment.paystack["PAYSTACK_PUBLIC_KEY"];
	}
}
module.exports = SettingsManger;