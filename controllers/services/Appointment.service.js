const Service = require('./Service');
const Appointments = require("../models/Appointments.model");
const EmailService = require('./Email.service');
const APPROVE = "approved";
const DECLINE = "declined";
const PENDING = "pending";
class AppointmentService extends Service {
	constructor() {
		super(Appointments, "-userCreator", "-timestamp");
	};

	rejectOverdueAppointments = async () => {
		const res = await this.getManyByFilter({
			timestamp: { $lte: Date.now() - 300000 /* passed by 5 munites*/ },
			status: PENDING
		})
		const emailService = new EmailService();
		res.forEach(appointment => {
			emailService.sendAppointmentRequestDenied({
				email: appointment.patient.email,
				appointment_id: appointment._id,
				user: {
					name: appointment.patient.name
				}
			})
		});
		await this.updateManyByFilter({
			timestamp: { $lte: Date.now() - 300000 /* passed by 5 munites*/ }
		}, {
			status: DECLINE
		})
	}

	getOne = async (_id) => {
		const response = await this.Model.findOne({ _id })
			.populate("healthProfessionalType", "name")
			.populate("healthProfessional", "name email creator")
			.populate("patient", "name email creator")
		return response;
	}

	getOneByFilter = async (filter) => {
		const response = await this.Model.findOne(filter, this.selection)
			.populate("healthProfessionalType", "name")
			.populate("healthProfessional", "name email creator")
			.populate("patient", "name email creator")
		return response;
	}

	getManyByFilter = async (filter) => {
		const response = await this.Model.find(filter, this.selection)
			.populate("healthProfessionalType", "name")
			.populate("healthProfessional", "name email creator")
			.populate("patient", "name email creator")
			.sort(this.sort);
		return response;
	}

	getPage = async (page, limit = 10) => {
		if (page < 0 || limit < 0)
			return [];
		const response = await this.Model.find({}, this.selection)
			.populate("healthProfessionalType", "name")
			.populate("healthProfessional", "name email creator")
			.populate("patient", "name email creator")
			.sort(this.sort)
			.limit(limit)
			.skip(limit * page)
		return response;
	}

	getAll = async () => {
		const response = await this.getManyByFilter();
		return response;
	}

	approve = async (_id, healthProfessional_id) => {
		return super.updateOne(_id, { healthProfessional: healthProfessional_id, status: APPROVE });
	}

	decline = async (_id) => {
		const response = await super.updateOne(_id, { status: DECLINE });
		return response;
	}

	getUserAppointments = async (user_id) => {
		const response = await this.Model.find({ $or: [{ patient: user_id }, { healthProfessional: user_id }] })
			.populate("healthProfessionalType", "name")
			.populate("healthProfessional", "name email creator")
			.populate("patient", "name email creator")
			.sort(this.sort);
		return response;
	}

	getUserAppointmentsPage = async (user_id, page, limit = 10) => {
		if (page < 0 || limit < 0)
			return [];
		const response = await this.Model.find({ $or: [{ patient: user_id }, { healthProfessional: user_id }] })
			.populate("healthProfessionalType", "name")
			.populate("healthProfessional", "name email creator")
			.populate("patient", "name email creator")
			.sort(this.sort)
			.limit(limit)
			.skip(limit * page);
		return response;
	}

	getOneUserAppointment = async (user_id, appointment_id) => {
		const response = await this.Model.findOne({ _id: appointment_id, $or: [{ patient: user_id }, { healthProfessional: user_id }] })
			.populate("healthProfessionalType", "name")
			.populate("healthProfessional", "name email creator")
			.populate("patient", "name email creator")
			.sort(this.sort)
		return response;
	}

	getUserAppointmentcount = async (user_id) => {
		const response = await this.Model.count({ $or: [{ patient: user_id }, { healthProfessional: user_id }] })
		return response;
	}

	deleteOneUserAppointment = async (user_id, appointment_id) => {
		const result = await this.Model.deleteOne({ _id: appointment_id, $or: [{ patient: user_id }, { healthProfessional: user_id }] });

		return result.deletedCount ?? 0;
	}

	updateOneUserAppointment = async (user_id, _id, data) => {
		const response = await this.Model.findOneAndUpdate(
			{ _id, $or: [{ patient: user_id }, { healthProfessional: user_id }] }, data,
			{ new: true, useFindAndModify: false, fields: this.selection })
			.sort(this.sort);
		return response;
	}
}

module.exports = AppointmentService;