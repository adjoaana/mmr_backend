const express = require('express');
const AuthenticationMiddleware = require('../middlewares/Authentication.middleware');
const router = express.Router();
const config = require("../config");
const SubscriptionController = require('../controllers/Subscription.controller');
const SubscriptionMiddleware = require('../middlewares/Subscription.middleware');

const subscriptionController = new SubscriptionController();

// @route    POST api/subscriptions/
// @desc     Add subscriptionPackages
// @access   Admin only
router.post('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	SubscriptionMiddleware.create(),
	subscriptionController.add
);

router.get('/users/',
	AuthenticationMiddleware.allowed_users([
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
		config.ORG_ROLE,
		config.HEALTH_FACILITY_ROLE,
	]),
	subscriptionController.getUserSubscriptions
);
router.get('/users/latest_subscriptions',
	AuthenticationMiddleware.allowed_users([
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
		config.ORG_ROLE,
		config.HEALTH_FACILITY_ROLE,
	]),
	subscriptionController.getUserCurrentSubscriptions
);

// @route    GET api/subscriptions/
// @desc     Get subscriptions
// @access   Public
router.get('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
	]),
	subscriptionController.get
);

// @route    GET api/subscriptions/
// @desc     Get subscriptions
// @access   Public
router.get('/count',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	subscriptionController.count
);



router.get('/paginate',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	subscriptionController.paginate
);

// @route    GET api/subscriptions/
// @desc     Get subscriptions
// @access   Public
router.get('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
		config.HEALTH_FACILITY_ROLE,
		config.ORG_ROLE,
	]),
	subscriptionController.getOne
);


// @route    PUT api/subscriptions/
// @desc     UPDATE subscriptions
// @access   Admin only
router.put('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	SubscriptionMiddleware.create(),
	subscriptionController.updateOne
);

// @route    DELETE api/subscriptions/
// @desc     Delete subscriptions
// @access   Admin only
router.delete('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	subscriptionController.softDeleteOne
);

router.delete('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	subscriptionController.delete
);

module.exports = router;