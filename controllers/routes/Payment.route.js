const express = require('express');
const AuthenticationMiddleware = require('../middlewares/Authentication.middleware');
const router = express.Router();
const config = require("../config");
const PaymentController = require('../controllers/Payment.controller');
const PaymentMiddleware = require('../middlewares/Payment.middleware');
const paymentController = new PaymentController();

// @route    POST api/payments/
// @desc     Add payments
// @access   Admin only
router.post('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	PaymentMiddleware.create(),
	paymentController.add
);

// @route    GET api/payments/
// @desc     Get payments
// @access   Public
router.get('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
	]),
	paymentController.get
);

// @route    GET api/payments/
// @desc     Get generate_payment_url
// @access   Public
router.post('/generate_payment_url/',
	AuthenticationMiddleware.allowed_users([
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
		config.ORG_ROLE,
		config.HEALTH_FACILITY_ROLE,
	]),
	PaymentMiddleware.generatePaymentRequest(),
	paymentController.generatePaymentRequest
);

router.post('/paystack_confirmation/',
	AuthenticationMiddleware.paystack(),
	paymentController.verifyPaystackPaymentWebhook,
);

// @route    GET api/payments/
// @desc     Get payments
// @access   Public
router.get('/count',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	paymentController.count
);

router.get('/paginate',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	paymentController.paginate
);

// @route    GET api/payments/
// @desc     Get payments
// @access   Public
router.get('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
	]),
	paymentController.getOne
);


// @route    PUT api/payments/
// @desc     UPDATE payments
// @access   Admin only
router.put('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	PaymentMiddleware.create(),
	paymentController.updateOne
);

// @route    DELETE api/payments/
// @desc     Delete payments
// @access   Admin only
router.delete('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	paymentController.softDeleteOne
);

router.delete('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	paymentController.delete
);

module.exports = router;