const express = require('express');
const HealthProfessionalTypeController = require('../controllers/HealthProfessionalType.controller');
const AuthenticationMiddleware = require('../middlewares/Authentication.middleware');
const router = express.Router();
const config = require("../config");
const healthProfessionalTypeController = new HealthProfessionalTypeController();

// @route    POST api/healthProfessionalTypes/
// @desc     Add healthProfessionalTypes
// @access   Admin only
router.post('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	healthProfessionalTypeController.add
);

// @route    GET api/healthProfessionalTypes/
// @desc     Get healthProfessionalTypes
// @access   Public
router.get('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
	]),
	healthProfessionalTypeController.get
);

// @route    GET api/healthProfessionalTypes/
// @desc     Get healthProfessionalTypes
// @access   Public
router.get('/count',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
	]),
	healthProfessionalTypeController.count
);

router.get('/paginate',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
	]),
	healthProfessionalTypeController.paginate
);

// @route    GET api/healthProfessionalTypes/
// @desc     Get healthProfessionalTypes
// @access   Public
router.get('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
	]),
	healthProfessionalTypeController.getOne
);



// @route    PUT api/healthProfessionalTypes/
// @desc     UPDATE healthProfessionalTypes
// @access   Admin only
router.put('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	healthProfessionalTypeController.updateOne
);

// @route    DELETE api/healthProfessionalTypes/
// @desc     Delete healthProfessionalTypes
// @access   Admin only
router.delete('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	healthProfessionalTypeController.deleteOne
);

router.delete('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	healthProfessionalTypeController.delete
);

module.exports = router;