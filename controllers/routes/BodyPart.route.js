const express = require('express');
const BodyPartController = require('../controllers/BodyPart.controller');
const AuthenticationMiddleware = require('../middlewares/Authentication.middleware');
const router = express.Router();
const config = require("../config");
const bodyPartController = new BodyPartController();

// @route    POST api/bodyParts/
// @desc     Add bodyParts
// @access   Admin only
router.post('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	bodyPartController.add
);

// @route    GET api/bodyParts/
// @desc     Get bodyParts
// @access   Public
router.get('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
	]),
	bodyPartController.get
);

// @route    GET api/bodyParts/
// @desc     Get bodyParts
// @access   Public
router.get('/count',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
	]),
	bodyPartController.count
);

router.get('/paginate',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
	]),
	bodyPartController.paginate
);

// @route    GET api/bodyParts/
// @desc     Get bodyParts
// @access   Public
router.get('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE,
		config.PATIENT_ROLE,
		config.HEALTH_PROFESSIONAL_ROLE,
	]),
	bodyPartController.getOne
);



// @route    PUT api/bodyParts/
// @desc     UPDATE bodyParts
// @access   Admin only
router.put('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	bodyPartController.updateOne
);

// @route    DELETE api/bodyParts/
// @desc     Delete bodyParts
// @access   Admin only
router.delete('/:id',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	bodyPartController.deleteOne
);

router.delete('/',
	AuthenticationMiddleware.allowed_users([
		config.ADMIN_ROLE
	]),
	bodyPartController.delete
);

module.exports = router;