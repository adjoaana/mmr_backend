"use strict"
const config = require('../config');
const SessionService = require('../services/Session.service');
const StorageManager = require("../utils/Storage.manager");
const Controller = require('./Controller');
class SesionController extends Controller {
	constructor() {
		super(new SessionService(), "sessions route");
		this.storageManager = new StorageManager();
	}

	addUserSession = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const body = req.body;
			body.healthProfessional = req.req_user._id;
			const response = await this.service.create(body);
			return res.status(201).json({
				status: 201,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			this.respondServerError(res);
		}
	}

	getDiagnosis = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const id = req.params.id;
			if (!id) {
				return this.respondParamsError(res);
			}
			const response = await this.service.getDiagnosis(id);
			return res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	getExercises = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const id = req.params.id;
			if (!id) {
				return this.respondParamsError(res);
			}
			let response = await this.service.getExercises(id);
			if (response.exercises) {
				response = await Promise.all(response.exercises.map(async item => {

					const video = item.exercise ? await this.storageManager.getFileUrl(item.exercise.video.key) : "";
					const audio = item.exercise ? await this.storageManager.getFileUrl(item.exercise.audio.key) : "";
					const thumbImage = item.exercise ? await this.storageManager.getFileUrl(item.exercise.thumbImage.key) : "";
					const image = item.exercise ? await this.storageManager.getFileUrl(item.exercise.image.key) : "";

					const new_item = {
						sets: item.sets,
						reps: item.reps,
						time: item.time,
						distance: item.distance,
						intensity: item.intensity,
						note: item.note,
						status: item.status,
						_id: item._id,
						exercise: {
							_id: item.exercise._id,
							title: item.exercise.title,
							description: item.exercise.description,
							bodyPart: item.exercise.bodyPart,
							createdAt: item.exercise.createdAt,
							updatedAt: item.exercise.updatedAt,
							video: {
								...item.exercise.video,
								url: video
							},
							audio: {
								...item.exercise.audio,
								url: audio
							},
							thumbImage: {
								...item.exercise.thumbImage,
								url: thumbImage
							},
							image: {
								...item.exercise.image,
								url: image
							},
						}
					}

					return new_item;
				}))
			}
			return res.status(200).json({
				status: 200,
				body: response ?? [],
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	addDiagnosis = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const _id = req.params.id;
			if (!_id) {
				return this.respondParamsError(res);
			}
			const {
				HPC,
				PC,
				PMHx,
				DHx,
				FSHx,
				OE,
				investigation,
				physicalDiagnosis,
				plan,
				note,
				recommendation,
			} = req.body;
			const data = {
				diagnosis: {
					PC,
					HPC,
					PMHx,
					DHx,
					FSHx,
					OE,
					investigation,
					physicalDiagnosis,
					plan,
					note,
					recommendation,
				}
			}
			const user_id = req.req_user._id;
			const response = await this.service.addDiagnosis({ user_id, _id, data });
			return res.status(200).json({
				status: 200,
				body: {
					_id: response._id,
					diagnosis: {
						PC,
						HPC,
						PMHx,
						DHx,
						FSHx,
						OE,
						investigation,
						physicalDiagnosis,
						plan,
						note,
						recommendation,
					}
				},
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			this.respondServerError(res);
		}
	}

	addExercise = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const _id = req.params.id;
			if (!_id) {
				return this.respondParamsError(res);
			}
			const user_id = req.req_user._id;
			const { exercise, sets, reps, time, distance, note, intensity } = req.body;
			const data = { exercise, sets, reps, time, distance, note, intensity };
			const response = await this.service.addExercise({ user_id, _id, data });

			return res.status(200).json({
				status: 200,
				body: {
					_id: response._id,
					exercises: response.exercises
				},
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			this.respondServerError(res);
		}
	}
	updateExerciseStatus = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const _id = req.params.id;
			const prescriptionId = req.params.prescriptionId;
			if (!_id || !prescriptionId) {
				return this.respondParamsError(res);
			}
			const user_id = req.req_user._id;
			const { status, patientComment } = req.body;
			let response = await this.service.updateSessionExerciseStatus({ user_id, _id, prescriptionId, status, patientComment });
			response = response.filter(item => item._id.toString() === prescriptionId)
			return res.status(200).json({
				status: 200,
				body: response[0],
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			this.respondServerError(res);
		}
	}
	addExercises = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const _id = req.params.id;
			if (!_id) {
				return this.respondParamsError(res);
			}
			const user_id = req.req_user._id;
			const data = req.body;
			const response = await this.service.addExercises({ user_id, _id, data });

			return res.status(200).json({
				status: 200,
				body: {
					_id: response._id,
					exercises: response.exercises
				},
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			this.respondServerError(res);
		}
	}

	getPastSessions = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const response = await this.service.getPastSessions();
			return res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	getUpcomingSessions = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const response = await this.service.getUpcomingSessions();
			return res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	getPastUserSessions = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.req_user._id
			const response = await this.service.getPastUserSessions(user_id);
			return res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	getUpcomingUserSessions = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.req_user._id
			const response = await this.service.getUpcomingUserSessions(user_id);
			return res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	userSessionCount = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.req_user._id;
			const response = await this.service.getUserSessioncount(user_id);
			return res.status(200).json({
				status: 200,
				body: {
					count: response
				},
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	userSessions = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.req_user._id
			const response = await this.service.getUserSessions(user_id);
			return res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	getUserSessions = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const user_id = req.params.user_id;
			if (!user_id) {
				return this.respondParamsError(res);
			}
			const response = await this.service.getUserSessions(user_id);
			return res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	paginateUserSessions = async (req, res) => {
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
			const response = await this.service.getUserSessionsPage(user_id, page, limit);
			return res.status(200).json({
				status: 200,
				pagination: {
					page: page,
					limit: limit
				},
				body: response,
				help: "Add page and limit GET query params",
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	userSessionsWithId = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const id = req.params.id;
			if (!id) {
				return this.respondParamsError(res);
			}
			const user_id = req.req_user._id
			const response = await this.service.getOneUserSession(user_id, id);
			return res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				status: 500,
				msg: "Internal server error.",
				route: this.routeString
			});
		}
	}

	updateOneUserSession = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const id = req.params.id;
			if (!id) {
				return this.respondParamsError(res);
			}
			const body = req.body;
			const user_id = req.req_user._id
			const response = await this.service.updateOneUserSession(user_id, id, body);
			res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			this.respondServerError(res);
		}

	}

	deleteOneUserSession = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const id = req.params.id;
			if (!id) {
				return this.respondParamsError(res);
			}
			const user_id = req.req_user._id
			const response = await this.service.deleteOneUserSession(user_id, id);
			res.status(200).json({
				status: 200,
				body: {
					deleted: response
				},
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			this.respondServerError(res);
		}
	}
}

module.exports = SesionController;