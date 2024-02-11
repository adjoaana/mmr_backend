const express = require('express');
const AuthenticationMiddleware = require('../middlewares/Authentication.middleware');
const StorageMiddleware = require('../middlewares/Storage.middleware'); 
const StorageController = require("../controllers/Storage.controller");
const config = require("../config");
const router = express.Router();

const controller = new StorageController();

router.post("/presignedUrl/", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE, config.PATIENT_ROLE, config.HEALTH_PROFESSIONAL_ROLE, config.ORG_ROLE, config.HEALTH_FACILITY_ROLE]), StorageMiddleware.presignedUrl(), controller.generatePresignedUrl)
router.post("/signedUrl/:key", AuthenticationMiddleware.allowed_users([config.ADMIN_ROLE, config.PATIENT_ROLE, config.HEALTH_PROFESSIONAL_ROLE, config.ORG_ROLE, config.HEALTH_FACILITY_ROLE]), controller.generatePresignedUrl)
router.get("/:key", controller.getFileUrl)

router.get("*", (req, res) => { res.status(404).json({ message: 'Endpoint not supported', status: 404 }); })
router.post("*", (req, res) => { res.status(404).json({ message: 'Endpoint not supported', status: 404 }); })

module.exports = router;