const { validationResult } = require('express-validator');
const StorageManager = require('../utils/Storage.manager');
class StorageController {
	generatePresignedUrl = async (req, res) => {
		this.routeString = "storage route"
		if (this.respondValidationError(req, res))
			return;

		try {
			const storageManager = new StorageManager();
			const key = req.body.key;
			const fileType = req.body.fileType;

			const response = await storageManager.getPresignedUrl(key, fileType);

			return res.status(200).json({
				status: 200,
				body: response,
				route: this.routeString
			});
		} catch (err) {
			console.log(err);
			this.respondServerError(res);
		}
	}

	getFileUrl = async (req, res) => {
		const { key } = req.params;
		if (!key) {
			res.status(404).send("File not found");
		}
		const url = await new StorageManager().getFileUrl(key);
		res.status(200).redirect(url);
	}

	respondValidationError(req, res){
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({ errors: errors.array() });
			return true;
		}
		return false;
	}
	respondServerError(res) {
		res.status(500).json({
			status: 500,
			msg: "Internal server error.",
			route: this.routeString
		})
	}
}

module.exports = StorageController;