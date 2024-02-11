const express = require('express');
const AdminController = require('../controllers/Admin.controller');
const AuthenticationController = require('../controllers/Authentication.controller');
const AuthenticationMiddleware = require('../middlewares/Authentication.middleware');
const config = require("../config");
const router = express.Router();
const controller = new AdminController();
const authController = new AuthenticationController("admin");

// @route    POST api/admins/register
// @desc     Register admin
// @access   Public
router.post('/',
	AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]),
	authController.register_validate(),
	authController.addAdmin
);

router.put(
	"/update",
	AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]),
	controller.admin_update_validate(),
	controller.updateAdmin
)
router.put(
	"/changePassword",
	AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]),
	controller.admin_change_password_validate(),
	controller.changePassword
)

router.put('/resetPasswordRequest',
	AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]),
	AuthenticationMiddleware.reset_password_request_validate(),
	controller.resetPasswordRequest)


router.get("/info",
	AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]),
	controller.getCurrentAdminInfo
)



// @route    POST api/admins/login
// @desc     Login admin
// @access   Public
router.post('/login/', AuthenticationMiddleware.login_validate(), authController.login);

router.get("/count", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.count)
router.get('/paginate', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.paginate);
router.get("/", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.get)
router.get("/:id", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.getOne)
router.put("/:id", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.updateOne)
router.patch("/:id", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.updateOne)
router.delete("/:id", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.deleteOne)

router.get("*", (req, res) => { res.status(404).json({ message: 'Endpoint not supported', status: 404 }); })
router.post("*", (req, res) => { res.status(404).json({ message: 'Endpoint not supported', status: 404 }); })
module.exports = router;