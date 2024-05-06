const express = require('express');
const ExerciseController = require('../controllers/Exercise.controller');
const AuthenticationMiddleware = require('../middlewares/Authentication.middleware');
const ExerciseMiddleware = require('../middlewares/Exercise.middleware');
const config = require("../config");


const router = express.Router();
const controller = new ExerciseController();

router.post('/text', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), ExerciseMiddleware.createPartText(), controller.addOneWithText);

router.get('/', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE, config.HEALTH_PROFESSIONAL_ROLE]), controller.get);

router.get('/paginate',
	AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE, config.HEALTH_PROFESSIONAL_ROLE]),
	ExerciseMiddleware.paginate(),
	controller.paginate
);

router.get("/count", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.count)

router.get('/:id', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE, config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE]), controller.getOne);

// @route    PUT api/exercises/
// @desc     get user
// @access   Admin only
// TODO write test
router.put('/:id', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]),  ExerciseMiddleware.update(), controller.updateOne);

// @route    DELETE api/exercises/
// @desc     get user
// @access   Admin only
router.delete('/:id', AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.deleteOne);

router.get("*", (req, res) => { res.status(404).json({ message: 'Endpoint not supported', status: 404 }); })

router.post("*", (req, res) => { res.status(404).json({ message: 'Endpoint not supported', status: 404 }); })

module.exports = router;