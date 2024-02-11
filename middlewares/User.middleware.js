const { body } = require('express-validator');
const config = require("../config");
const StorageManager = require('../utils/Storage.manager');
const fs = require("fs");
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)
class UserMiddleware {
	static create_parent_user = () => {
		return [
			body('name', 'name is required').exists(),
			body('email', 'Invalid email').exists().isEmail(),
		]
	}

	static rejectLicense = () => {
		return [
			body("reason", "reason for rejection is required").exists(),
		]
	}
	static create_admin_user = () => {
		return [
			body('name', 'name is required').exists(),
			body('email', 'Invalid email').exists().isEmail(),
			body('role', 'role is required').exists(),
			body('role').custom(value => {
				if (![config.PATIENT_ROLE, config.HEALTH_PROFESSIONAL_ROLE].includes(value)) {
					throw new Error(`role must be '${config.PATIENT_ROLE}' or '${config.HEALTH_PROFESSIONAL_ROLE}' `);
				}
				return true
			}),
		]
	}
	static update_profile_image = () => {
		return [
			body('photo', 'photo file is required').exists().isObject(),
		]
	}
	static sendFilesToS3 = async (req, res, next) => {
		if (req.files) {
			console.log(req.files);
			const fileTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
			const file_name = "photo";
			try {
				// Check for allowed file types.
				const file = req.files[file_name][0];
				if (!fileTypes.includes(file.mimetype))
					return res.json({
						message: `${file_name} type not allowed. Allowed fileTypes: ${fileTypes}`,
						status: 400,
					});
				console.log("size exception", file.size, 1024 * 2000);

				// Check for allowed file size
				if (file.size > 1024 * 2000) {
					return res.json({
						message: `${file_name} size too large. Allowed file size is 2MB maximum`,
						status: 400,
					});
				}
				const result = await new StorageManager().upload(file);
				req.body[file_name] = {
					url: result.Location,
					key: result.Key,
					fileType: file.mimetype.split("/")[0]
				}
				console.log(process.env)
				unlinkFile(file.path).then((r) => { console.log(r) }).catch(e => { console.log(e) });
				next();
			} catch (error) {
				console.log(error);
				const message = `Please provide a ${file_name} image/${fileTypes} file type less than 2MB.`;
				return res.status(400).json({
					message,
					status: 400,
				});
			}
		} else {
			next();
		}
	}
}

module.exports = UserMiddleware;