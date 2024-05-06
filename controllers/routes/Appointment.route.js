require("dotenv").config();
const AppointmentMiddleware = require('../middlewares/Appointment.middleware');
const AuthenticationMiddleware = require('../middlewares/Authentication.middleware');
const AppointmentController = require("../controllers/Appointment.controller")
const config = require("../config");
const express = require('express');


const router = express.Router();
const controller = new AppointmentController();


router.get("/users", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.userAppointments)

router.get("/users/paginate", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE,config.PATIENT_ROLE,]),controller.paginateUserAppointments)

router.post("/users", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE]), AppointmentMiddleware.create_user_appointment(), controller.addUserAppointment)

router.get("/users/count", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.userAppointmentCount)

router.get("/users/:id", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.userAppointmentsWithId)

router.delete("/users/:id", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.deleteOneUserAppointment)

router.put("/users/:id", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.PATIENT_ROLE,]), controller.updateOneUserAppointment)

router.put("/users/:id/approve", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE,]), controller.approveUserAppointment)

router.put("/users/:id/decline", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE,]), controller.declineUserAppointment)

router.post("/", AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE, config.ADMIN_ROLE]), AppointmentMiddleware.create(), controller.add)

router.get("/", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.get)

router.get("/paginate", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.paginate)

router.get("/count", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.count)

router.get("/:id", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.getOne)

router.put("/:id", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.updateOne)

router.delete("/:id", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.deleteOne)

router.put("/:id/approve",AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), AppointmentMiddleware.approval(),controller.approve)

router.put("/:id/decline",AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE]), controller.decline)

module.exports = router;

