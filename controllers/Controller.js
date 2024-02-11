"use strict"
const { validationResult } = require('express-validator');
class Controller {
	constructor(service, routeString = "") {
		this.service = service;
		this.routeString = routeString;
	}

	add = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const body = req.body;
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

	get = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const response = await this.service.getAll();
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

	paginate = async (req, res) => {
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
			const response = await this.service.getPage(page, limit);
			res.status(200).json({
				status: 200,
				pagination: {
					page: page,
					limit: limit
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

	getOne = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const id = req.params.id;
			if (!id) {
				this.respondParamsError(res);
				return null;
			}
			const response = await this.service.getOne(id);
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

	count = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;
		try {
			const response = await this.service.count();
			res.status(200).json({
				status: 200,
				body: {
					count: response,
				},
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}
	}

	update = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const body = req.body;
			const response = await this.service.create(body);
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

	updateOne = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const id = req.params.id;
			if (!id) {
				this.respondParamsError(res);
				return
			}
			const body = req.body;
			const response = await this.service.updateOne(id, body);
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

	delete = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const response = await this.service.deleteAll();
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

	deleteOne = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const id = req.params.id;
			if (!id) {
				this.respondParamsError(res);
				return
			}
			const response = await this.service.deleteOne(id);
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

	softDeleteOne = async (req, res) => {
		if (this.respondValidationError(req, res))
			return;

		try {
			const id = req.params.id;
			if (!id) {
				this.respondParamsError(res);
				return
			}
			const body = {
				deleted: {
					status: true
				}
			}
			const response = await this.service.updateOne(id, body);
			const update_body = response._doc;
			res.status(200).json({
				status: 200,
				body: {
					...update_body
				},
				route: this.routeString
			});
			return null;
		} catch (err) {
			console.log(err);
			return this.respondServerError(res);
		}

	}

	respondServerError = (res) => {
		res.status(500).json({
			status: 500,
			msg: "Internal server error.",
			route: this.routeString
		})
		return null;
	}
	respondValidationError = (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({ errors: errors.array() });
			return true;
		}else{
			return false
		}
	}

	respondParamsError = (res) => {
		res.status(400).json({
			status: 400,
			message: "Invalid params provided."
		});
	}

	respondAccessDenied = (res) => {
		res.status(401).json({
			status: 401,
			message: "Access denied. "
		});
	}


}

module.exports = Controller;