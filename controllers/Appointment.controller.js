"use strict"
const config = require('../config');
const AppointmentService = require('../services/Appointment.service');
const EmailService = require('../services/Email.service');
const SessionService = require('../services/Session.service');
const Controller = require('./Controller');
class AppointmentController extends Controller {
	constructor() {
		super(new AppointmentService(), "appointments route");
		this.emailService = new EmailService();
	}
	addUserAppointment = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const body = req.body;

			if (req.req_user.role === config.HEALTH_PROFESSIONAL_ROLE) {
				body.healthProfessional = req.req_user._id;
			} else {
				if (req.req_user.creator.type === config.HEALTH_PROFESSIONAL_ROLE) {
					body.healthProfessional = req.req_user.creator.id;
				}
				body.patient = req.req_user._id;
			}
			const response = await this.service.create(body);
			res.status(201).json({
				status: 201,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}
	userAppointmentCount = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.req_user._id;
			const response = await this.service.getUserAppointmentcount(user_id);
			res.status(200).json({
				status: 200,
				body: {
					count: response
				},
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	userAppointments = async (req, res) => {
		if (this.respondValidationError(req, res))
			return null;
		try {
			const user_id = req.req_user._id
			const response = await this.service.getUserAppointments(user_id);
			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	paginateUserAppointments = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			let { page, limit } = req.query;
			if (!page) {
				page = 0;
			}
			if (!limit) {
				limit = 10
			}
			const user_id = req.req_user._id
			const response = await this.service.getUserAppointmentsPage(user_id, page, limit);
			res.status(200).json({
				status: 200,
				pagination: {
					page,
					limit
				},
				body: response,
				help: "Add page and limit GET query params",
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	userAppointmentsWithId = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const appointment_id = req.params.id;
			const user_id = req.req_user._id
			const response = await this.service.getOneUserAppointment(user_id, appointment_id);
			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	updateOneUserAppointment = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const id = req.params.id;
			if (!id) {
				this.respondParamsError(res);
				return
			}
			const body = req.body;
			const user_id = req.req_user._id
			const response = await this.service.updateOneUserAppointment(user_id, id, body);
			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}

	}

	deleteOneUserAppointment = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const id = req.params.id;
			if (!id) {
				this.respondParamsError(res);
				return
			}
			const user_id = req.req_user._id
			const response = await this.service.deleteOneUserAppointment(user_id, id);
			res.status(200).json({
				status: 200,
				body: {
					deleted: response
				},
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	approveUserAppointment = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const { id } = req.params;
			const { create_session } = req.query;
			const { healthProfessional_id } = req.req_user._id;
			const appointment = await this.service.getOneByFilter({ _id: id });
			if (appointment.patient.creator.type !== config.PHYSIO_ROLE || !appointment.patient.creator.id.equals(req.req_user._id)) {
				return this.respondAccessDenied(res);
			}
			const response = await this.service.approve(id, healthProfessional_id);


			// Schedule for patient
			this.emailService.sendAppointmentRequestApproval(appointment.patient.email, appointment.patient.name)
			if (create_session) {
				const sessionService = new SessionService();
				const session = {
					patient: response.patient,
					appointment: response._id,
					healthProfessional: response.healthProfessional,
					healthProfessionalType: response.healthProfessionalType,
					timestamp: response.timestamp,
					type: response.type
				}

				await sessionService.add(session);
			}
			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}

	}
	declineUserAppointment = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const { id } = req.params;
			const appointment = await this.service.getOneByFilter({ _id: id });
			if (appointment.patient.creator.type !== config.PHYSIO_ROLE || !appointment.patient.creator.id.equals(req.req_user._id)) {
				return this.respondAccessDenied(res);
			}
			const response = await this.service.decline(id);

			const emailService = new EmailService();

			// Schedule for patient
			this.emailService.sendAppointmentRequestDenied(appointment.patient.email, appointment.patient.name)

			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	approve = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const { id } = req.params;
			const { create_session } = req.query;
			const { healthProfessional_id } = req.body;
			const response = await this.service.approve(id, healthProfessional_id);
			const appointment = await this.service.getOneByFilter({ _id: id });

			// Notify patient
			this.emailService.sendAppointmentRequestApproval(appointment.patient.email, appointment.patient.name)

			// Notify healthProfessional
			this.emailService.sendAppointmentRequestApprovalProfessional(appointment.healthProfessional.email, appointment.healthProfessional.name)
			if (create_session) {
				const sessionService = new SessionService();
				const session = {
					patient: response.patient,
					appointment: response._id,
					healthProfessional: response.healthProfessional,
					healthProfessionalType: response.healthProfessionalType,
					timestamp: response.timestamp,
					type: response.type
				}

				await sessionService.add(session);
			}


			res.status(200).json({
				status: 200,
				body: response,
				message: create_session ? "Session created for this appointment" : "No Session created for this appointment",
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}

	}

	decline = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const { id } = req.params;
			const response = await this.service.decline(id);
			const appointment = await this.service.getOneByFilter({ _id: id });
			const emailService = new EmailService();

			// Schedule for patient
			this.emailService.sendAppointmentRequestDenied(appointment.patient.email, appointment.patient.name)

			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}
}

module.exports = AppointmentController;