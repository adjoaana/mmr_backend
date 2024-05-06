const express = require('express');
const AuthenticationController = require('../controllers/Authentication.controller');
const UserController = require('../controllers/User.controller');
const AuthenticationMiddleware = require('../middlewares/Authentication.middleware');
const UserMiddleware = require('../middlewares/User.middleware');
const config = require("../config");
const router = express.Router();
const controller = new UserController();
const authController = new AuthenticationController("user");

// @route    POST api/users/register
// @desc     Register user
// @access   Public
router.post('/register/', authController.register_validate(), authController.register);

// @route    POST api/users/login
// @desc     Login user
// @access   Public
router.post('/login/', AuthenticationMiddleware.login_validate(), authController.login);

router.put("/update",
	AuthenticationMiddleware.allowed_users([config.PATIENT_ROLE, config.HEALTH_PROFESSIONAL_ROLE, config.HEALTH_FACILITY_ROLE, config.ORG_ROLE]),
	AuthenticationMiddleware.user_update_validate(),
	authController.updateUser
)

router.put("/healthProfessionalExtra",
	AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE]),
	AuthenticationMiddleware.healthProfessionalExtra(),
	controller.updatehealthProfessionalExtra
)
router.get("/healthProfessionalExtra",
	AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE]),
	controller.getHealthProfessionalExtra
)

router.put("/completeUserOnboarding",
	AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE]),
	controller.completeHealthProfessionalOnboarding
)

router.put('/addedLicense',
	AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE]),
	controller.addedLicense
);

// @route    POST api/users/resetPasswordRequest
// @desc     Register user
// @access   Public
router.put('/resetPasswordRequest',
	AuthenticationMiddleware.reset_password_request_validate(),
	authController.resetPasswordRequest
)

// @route    POST api/users/verifyPasswordResetToken
// @desc     verify email token sent to user
// @access   Public
router.put('/verifyEmail',
	AuthenticationMiddleware.verify_email_token_validate(),
	authController.verifyEmailToken
)

// @route    POST api/users/verifyPasswordResetToken
// @desc     verify password token sent to user
// @access   Public
router.put('/verifyPasswordResetToken',
	AuthenticationMiddleware.verify_password_token_validate(),
	authController.verifyPasswordToken
)

// @route    POST api/users/resetPassword
// @desc     Register user
// @access   Public
router.put('/resetPassword',
	AuthenticationMiddleware.reset_password_validate(),
	authController.resetPassword
)

router.put("/changePassword",
	AuthenticationMiddleware.allowed_users([config.PATIENT_ROLE, config.HEALTH_PROFESSIONAL_ROLE, config.HEALTH_FACILITY_ROLE, config.ORG_ROLE]),
	AuthenticationMiddleware.user_change_password_validate(),
	authController.changePassword
)

// @route    Get api/users/users
// @desc     Get users
// @access   Public Health Professional, Org and Clinic only
router.get('/users/',
	AuthenticationMiddleware.allowed_users([
		config.HEALTH_PROFESSIONAL_ROLE,
		config.ORG_ROLE,
		config.HEALTH_FACILITY_ROLE
	]), controller.getUsers);

router.get('/users/paginate', AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.ORG_ROLE, config.HEALTH_FACILITY_ROLE]), AuthenticationMiddleware.isParentUser(), controller.getPaginatedGroupUsers);

router.get("/users/count", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.ORG_ROLE, config.HEALTH_FACILITY_ROLE]), AuthenticationMiddleware.isParentUser(), controller.getGroupUsersCount)

router.get("/info", AuthenticationMiddleware.allowed_users([config.PATIENT_ROLE, config.HEALTH_PROFESSIONAL_ROLE, config.HEALTH_FACILITY_ROLE, config.ORG_ROLE]), controller.getCurrentUserInfo)


// @route    Get api/users/users
// @desc     Get one user
// @access   Public Health Professional only
router.get('/users/:id', AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.ORG_ROLE, config.HEALTH_FACILITY_ROLE]), AuthenticationMiddleware.isParentUser(), controller.getOneGroupUser);


// @route    POST api/users/users
// @desc     Create user
// @access   Public Health Professional
router.post('/users/', AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.ORG_ROLE, config.HEALTH_FACILITY_ROLE]), AuthenticationMiddleware.isParentUser(), UserMiddleware.create_parent_user(), controller.userCreateUser);

// @route    PUT api/users/users
// @desc     Update user
// @access   Public Health Professional
router.put('/users/:id', AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.ORG_ROLE, config.HEALTH_FACILITY_ROLE]), AuthenticationMiddleware.isParentUser(), controller.updateOneGroupUsers);

router.get("/count", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.count)

// @route    DELETE api/users/users
// @desc     Delete user
// @access   Public Health Professional
router.delete('/users/:id', AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.ORG_ROLE, config.HEALTH_FACILITY_ROLE]), AuthenticationMiddleware.isParentUser(), controller.deleteOneGroupUsers);

// @route    POST api/users/
// @desc     Add user
// @access   Admin only
router.post('/', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), UserMiddleware.create_admin_user(), controller.createAdminUser);

// @route    POST api/users/
// @desc     get users
// @access   Admin only
router.get('/', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.get);
router.get('/paginate', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.paginate);

router.put('/:id/approveLicense', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.approveLicense);
router.put('/:id/rejectLicense', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), UserMiddleware.rejectLicense(), controller.declineLicense);

router.get('/unapprovedHealthProfessionals', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.getUnapprovedHealthProfessionals);

// @route    GET api/users/
// @desc     get user
// @access   Admin only
router.get('/:id', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.getOne);

// @route    PUT api/users/
// @desc     get user
// @access   Admin only
router.put('/:id', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.updateOneAdminUsers);


// @route    DELETE api/users/
// @desc     get user
// @access   Admin only
router.delete('/:id', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.deleteOne);

router.get("*", (req, res) => { res.status(404).json({ message: 'Endpoint not supported', status: 404 }); })

router.post("*", (req, res) => { res.status(404).json({ message: 'Endpoint not supported', status: 404 }); })

module.exports = router;