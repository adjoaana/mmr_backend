const Service = require('./Service');
const Sessions = require("../models/Session.model");
const EmailService = require('./Email.service');
const util = require('util')
class SessionService extends Service {
	constructor() {
		super(Sessions, "", "-timestamp");
	};

	add = async (data) => {
		const session1 = await this.create(data);
		const session = await this.Model.findOne({ _id: session1._id })
			.populate("patient", "email name")
			.populate("healthProfessional", "email name");

		const emailService = new EmailService();

		// Schedule for patient
		emailService.scheduleSessionReminder({
			email: session.patient.email,
			session_id: session._id,
			timestamp: session.timestamp,
			user: {
				name: session.patient.name
			}
		})

		// Schedule for healthprofessional
		emailService.scheduleSessionReminder({
			email: session.healthProfessional.email,
			session_id: session._id,
			timestamp: session.timestamp,
			user: {
				name: session.healthProfessional.name
			}
		})
		return session1;
	}

	getOne = async (_id) => {
		const response = await this.Model.findOne({ _id })
			.populate("patient", "name email creator")
			.populate("healthProfessionalType", "name")
			.populate("appointment")
			.populate("exercises")
			.populate("healthProfessional", "name email creator")
		return response;
	}

	getDiagnosis = async (_id) => {
		const response = await this.Model.findOne({ _id }, "diagnosis")
		return response;
	}

	getExercises = async (_id) => {
		const response = await this.Model.findOne({ _id }, "exercises")
			.populate("exercises.exercise")
			.populate({
				path: 'exercises',
				populate: {
					path: 'exercise',
					populate: {
						path: 'bodyPart',
						model: 'BodyParts',
						select: "name description"
					}
				}
			})
			.populate("exercises.exercise.bodyPart", "name description")
		return response;
	}

	getOneByFilter = async (filter) => {
		const response = await this.Model.findOne(filter, this.selection)
			.populate("patient", "name email creator")
			.populate("healthProfessionalType", "name")
			.populate("appointment")
			.populate("exercises")
			.populate("healthProfessional", "name email creator")
		return response;
	}

	getPage = async (page, limit = 10) => {
		if (page < 0 || limit < 0)
			return [];
		const response = await this.Model.find({}, this.selection)
			.populate("patient", "name email creator")
			.populate("healthProfessionalType", "name")
			.populate("appointment")
			.populate("exercises")
			.populate("healthProfessional", "name email creator")
			.sort(this.sort)
			.limit(limit)
			.skip(limit * page)
		return response;
	}
	getManyByFilter = async (filter) => {
		const response = await this.Model.find(filter, this.selection)
			.populate("patient", "name email creator")
			.populate("healthProfessionalType", "name")
			.populate("appointment")
			.populate("exercises")
			.populate("healthProfessional", "name email creator")
			.sort(this.sort);
		return response;
	}

	getUserSessions = async (user_id) => {
		const response = await this.Model.find({ $or: [{ patient: user_id }, { healthProfessional: user_id }] })
			.populate("patient", "name email creator")
			.populate("healthProfessionalType", "name")
			.populate("appointment")
			.populate("exercises")
			.populate("healthProfessional", "name email creator")
			.sort(this.sort);
		return response;
	}

	getPastUserSessions = async (user_id) => {
		const time = new Date().getTime() + 60000 * 5; // Add 5 minute delay
		const response = await this.Model.find({ timestamp: { $lt: time }, $or: [{ patient: user_id }, { healthProfessional: user_id }] })
			.populate("patient", "name email creator")
			.populate("healthProfessionalType", "name")
			.populate("appointment")
			.populate("exercises")
			.populate("healthProfessional", "name email creator")
			.sort(this.sort);
		return response;
	}

	getUpcomingUserSessions = async (user_id) => {
		const time = new Date().getTime() - 60000 * 15;// Add 15 minutes in future
		const response = await this.Model.find({ timestamp: { $gt: time }, $or: [{ patient: user_id }, { healthProfessional: user_id }] })
			.populate("patient", "name email creator")
			.populate("healthProfessionalType", "name")
			.populate("appointment")
			.populate("exercises")
			.populate("healthProfessional", "name email creator")
			.sort(this.sort);
		return response;
	}

	getPastSessions = async () => {
		const time = new Date().getTime() - 60000 * 5; //Add 5 minutes delay
		const response = await this.Model.find({ timestamp: { $lt: time } })
			.populate("patient", "name email creator")
			.populate("healthProfessionalType", "name")
			.populate("appointment")
			.populate("exercises")
			.populate("healthProfessional", "name email creator")
			.sort(this.sort);
		return response;
	}
	getUserSessioncount = async (user_id) => {
		const response = await this.Model.count({ $or: [{ patient: user_id }, { healthProfessional: user_id }] })
		return response;
	}

	getUpcomingSessions = async () => {
		const time = new Date().getTime() - 60000 * 15; // Add 15 minute in future
		const response = await this.Model.find({ timestamp: { $gt: time } })
			.populate("patient", "name email creator")
			.populate("healthProfessionalType", "name")
			.populate("appointment")
			.populate("exercises")
			.populate("healthProfessional", "name email creator")
			.sort(this.sort);
		return response;
	}

	addExercise = async ({ user_id, _id, data }) => {
		const response = await this.Model.findOneAndUpdate(
			{ _id, $or: [{ healthProfessional: user_id }] }, { $push: { exercises: data } },
			{ new: true, useFindAndModify: false, fields: this.selection })
			.populate("exercises");
		return response;
	}

	addExercises = async ({ user_id, _id, data }) => {
		const response = await this.Model.findOneAndUpdate(
			{ _id, healthProfessional: user_id }, { exercises: data },
			{ new: true, useFindAndModify: false, fields: this.selection })
			.populate("exercises");
		return response;
	}

	addDiagnosis = async ({ user_id, _id, data }) => {
		const response = await this.Model.findOneAndUpdate(
			{ _id, healthProfessional: user_id }, data,
			{ new: true, useFindAndModify: false, fields: this.selection })
		return response;
	}

	updateSessionExerciseStatus = async ({ user_id, _id, prescriptionId, status, patientComment }) => {
		const response = await this.Model.findOneAndUpdate(
			{ _id, patient: user_id, "exercises._id": prescriptionId },
			{
				$set: {
					"exercises.$.status": status,
					"exercises.$.patientComment": patientComment,
				}
			},
			{ new: true, fields: this.selection }
		)
		return response.exercises;
	}

	getUserSessionsPage = async (user_id, page, limit) => {
		if (page < 0 || limit < 0)
			return [];
		const response = await this.Model.find({ $or: [{ patient: user_id }, { healthProfessional: user_id }] })
			.populate("patient", "name email creator")
			.populate("healthProfessionalType", "name")
			.populate("appointment")
			.populate("exercises")
			.populate("healthProfessional", "name email creator")
			.sort(this.sort)
			.limit(limit)
			.skip(limit * page)
		return response;
	}

	getOneUserSession = async (user_id, session_id) => {
		const response = await this.Model.findOne({ _id: session_id, $or: [{ patient: user_id }, { healthProfessional: user_id }] })
			.populate("patient", "name email creator")
			.populate("healthProfessionalType", "name")
			.populate("appointment")
			.populate("exercises")
			.populate("healthProfessional", "name email creator")
		return response;
	}

	deleteOneUserSession = async (user_id, session_id) => {
		const result = await this.Model.deleteOne({ _id: session_id, $or: [{ patient: user_id }, { healthProfessional: user_id }] });

		return result.deletedCount ?? 0;
	}

	updateOneUserSession = async (user_id, _id, data) => {
		const response = await this.Model.findOneAndUpdate({
			_id,
			$or: [{ patient: user_id }, { healthProfessional: user_id }]
		},
			data,
			{ new: true, useFindAndModify: false, fields: this.selection })
		return response;
	}

	getUserSessionsCount = async (user_id) => {
		const response = await this.Model.count({ $or: [{ patient: user_id }, { healthProfessional: user_id }] })
		return response;
	}
}

module.exports = SessionService;