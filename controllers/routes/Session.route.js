const config = require("../config");
const SessionMiddleware = require('../middlewares/Session.middleware');
const SessionController = require("../controllers/Session.controller");
const AuthenticationMiddleware = require('../middlewares/Authentication.middleware');

const express = require('express');

const router = express.Router();
const controller = new SessionController();
// routes here are /api/sessions/..

router.get("/users", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.userSessions)
router.get("/users/paginate", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.paginateUserSessions)

router.post("/users", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE]), SessionMiddleware.createUserSession(), controller.addUserSession)

router.get("/users/count", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.userSessionCount)

router.get("/users/upcoming", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.getUpcomingUserSessions)

router.get("/users/past/", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.getPastUserSessions)

router.get("/users/:id", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.userSessionsWithId)

router.delete("/users/:id", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE]), controller.deleteOneUserSession)


router.put("/users/:id", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE]), controller.updateOneUserSession)


router.put("/users/:id/diagnosis", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE]), SessionMiddleware.addDiagnosis(), controller.addDiagnosis)
router.get("/users/:id/diagnosis", AuthenticationMiddleware.allowed_users([config.PATIENT_ROLE, config.HEALTH_PROFESSIONAL_ROLE]), controller.getDiagnosis)

router.put("/users/:id/exercise", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE]), controller.addExercise)

router.put("/users/:id/exercises/:prescriptionId", AuthenticationMiddleware.allowed_users([config.PATIENT_ROLE]), SessionMiddleware.updateExerciseStatus(), controller.updateExerciseStatus)
router.put("/users/:id/exercises", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE]), SessionMiddleware.addExercises(), controller.addExercises)
router.get("/users/:id/exercises", AuthenticationMiddleware.allowed_users([config.PATIENT_ROLE, config.HEALTH_PROFESSIONAL_ROLE]), controller.getExercises)


router.get("/count", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.count)

router.post("/", AuthenticationMiddleware.allowed_users([ config.ADMIN_ROLE]), SessionMiddleware.create(), controller.add)

router.get("/", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE,]), controller.get)

router.get("/past", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE,]), controller.getPastSessions)
router.get("/upcoming", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE,]), controller.getUpcomingSessions)

router.get("/paginate", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.paginate)

router.get("/:id", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE, config.HEALTH_PROFESSIONAL_ROLE]), controller.getOne)

router.get("/user_sessions/:user_id", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE, config.HEALTH_PROFESSIONAL_ROLE]), controller.getUserSessions)

router.put("/:id", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.updateOne)

router.delete("/:id", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.deleteOne)

module.exports = router;