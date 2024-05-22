require("dotenv").config();
const TemplateMiddleware = require("../middlewares/Template.middleware");
const AuthenticationMiddleware = require("../middlewares/Authentication.middleware");
const TemplateController = require("../controllers/Template.controller");
const storageManager = require("../utils/Storage.manager");
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
  controller.getUserTemplates
);

router.post(
  "/",
  AuthenticationMiddleware.allowed_users([
    config.ADMIN_ROLE,
    config.HEALTH_PROFESSIONAL_ROLE,
  ]),
  storageManager.MUpload.single("file"),
  // TemplateMiddleware.create, //for validation basically
  controller.addUserTemplates
);

/* 
@route - /api/templates/:id 
@method - GET
@desc - Get details of one exercise template
*/
router.get(
  "/:id",
  AuthenticationMiddleware.allowed_users([
    config.ADMIN_ROLE,
    config.HEALTH_PROFESSIONAL_ROLE,
  ]),
  controller.getOne
);
/* 
@route - /api/templates/:id 
@method - PUT
@desc - Update details of one exercise template
*/
router.put(
  "/:id",
  AuthenticationMiddleware.allowed_users([
    config.ADMIN_ROLE,
    config.HEALTH_PROFESSIONAL_ROLE,
  ]),
  storageManager.MUpload.single("file"),
  controller.updateOneUserTemplate
);
/* 
@route - /api/templates/:id 
@method - DELETE
@desc - Delete existing exercise template
*/
router.delete(
  "/:id",
  AuthenticationMiddleware.allowed_users([
    config.ADMIN_ROLE,
    config.HEALTH_PROFESSIONAL_ROLE,
  ]),
  controller.deleteOneUserTemplate
);

module.exports = router;
