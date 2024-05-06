const express = require('express');
const SettingsController = require('../controllers/Settings.controller');
const AuthenticationMiddleware = require('../middlewares/Authentication.middleware');
const router = express.Router();
const config = require("../config");
const settingsController = new SettingsController();

// @route    GET api/settings/
// @desc     Get Settings
// @access   Public
router.get('/get_paystack_payment_public_key',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
		config.ORG_ROLE,
		config.HEALTH_FACILITY_ROLE,
	]),
	settingsController.getPaystackPaymentPublicKey
);

router.get('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
	]),
	settingsController.get
);

// @route    PUT api/settings/
// @desc     UPDATE Settings
// @access   Admin only
router.put('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
	]),
	settingsController.update
);

module.exports = router;