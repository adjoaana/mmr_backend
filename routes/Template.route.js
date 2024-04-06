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
  // TemplateMiddleware.create, //for validation basically
  controller.add
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
