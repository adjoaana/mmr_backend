require("dotenv").config();
const TemplateMiddleware = require("../middlewares/Template.middleware");
const AuthenticationMiddleware = require("../middlewares/Authentication.middleware");
const TemplateController = require("../controllers/Template.controller");
const config = require("../config");
const express = require('express');


const router = express.Router();
const controller = new TemplateController();

//routes for /api/templates..
router.get("/", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE, config.HEALTH_PROFESSIONAL_ROLE]), controller.get)

router.post("/", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE, config.HEALTH_PROFESSIONAL_ROLE]), TemplateMiddleware.create(), controller.add)


outer.get("/users", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.userAppointments)

router.get("/users/paginate", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE,config.PATIENT_ROLE,]),controller.paginateUserAppointments)

router.post("/users", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE]), AppointmentMiddleware.create_user_appointment(), controller.addUserAppointment)

router.get("/users/count", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.userAppointmentCount)

router.get("/users/:id", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.userAppointmentsWithId)

router.delete("/users/:id", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.deleteOneUserAppointment)

router.put("/users/:id", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.updateOneUserAppointment)

router.put("/users/:id/approve", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE,]), controller.approveUserAppointment)

router.put("/users/:id/decline", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE,]), controller.declineUserAppointment)
module.exports = router