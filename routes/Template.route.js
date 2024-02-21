require("dotenv").config();
const TemplateMiddleware = require("../middlewares/Template.middleware");
const AuthenticationMiddleware = require("../middlewares/Authentication.middleware");
const TemplateController = require("../controllers/Template.controller");
const config = require("../config");
const express = require("express");

const router = express.Router();
const controller = new TemplateController();

//routes for /api/templates..
router.get(
  "/",
  AuthenticationMiddleware.allowed_users([
    config.ADMIN_ROLE,
    config.HEALTH_PROFESSIONAL_ROLE,
  ]),
  controller.get
);

router.post(
  "/",
  AuthenticationMiddleware.allowed_users([
    config.ADMIN_ROLE,
    config.HEALTH_PROFESSIONAL_ROLE,
  ]),
  // TemplateMiddleware.create,
  controller.add
);

module.exports = router;
