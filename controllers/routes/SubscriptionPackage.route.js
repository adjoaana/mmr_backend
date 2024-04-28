const express = require('express');
const AuthenticationMiddleware = require('../middlewares/Authentication.middleware');
const router = express.Router();
const config = require("../config");
const SubscriptionPackageController = require('../controllers/SubscriptionPackage.controller');
const SubscriptionPackageMiddleware = require('../middlewares/SubscriptionPackage.middleware');
const subscriptionPackageController = new SubscriptionPackageController();

// @route    POST api/subscriptionPackages/
// @desc     Add subscriptionPackages
// @access   Admin only
router.post('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	SubscriptionPackageMiddleware.create(),
	subscriptionPackageController.add
);

// @route    GET api/subscriptionPackages/
// @desc     Get subscriptionPackages
// @access   Public
router.get('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
	]),
	subscriptionPackageController.get
);

// @route    GET api/subscriptionPackages/
// @desc     Get subscriptionPackages
// @access   Public
router.get('/count',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	subscriptionPackageController.count
);

router.get('/paginate',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	subscriptionPackageController.paginate
);

router.get('/current_offerings',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
		config.HEALTH_FACILITY_ROLE,
		config.ORG_ROLE,
	]),
	subscriptionPackageController.getCurrentOfferings
);

// @route    GET api/subscriptionPackages/
// @desc     Get subscriptionPackages
// @access   Public
router.get('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
		config.HEALTH_FACILITY_ROLE,
		config.ORG_ROLE,
	]),
	subscriptionPackageController.getOne
);


// @route    PUT api/subscriptionPackages/
// @desc     UPDATE subscriptionPackages
// @access   Admin only
router.put('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	SubscriptionPackageMiddleware.create(),
	subscriptionPackageController.updateOne
);

// @route    DELETE api/subscriptionPackages/
// @desc     Delete subscriptionPackages
// @access   Admin only
router.delete('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	subscriptionPackageController.softDeleteOne
);

router.delete('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	subscriptionPackageController.delete
);

module.exports = router;