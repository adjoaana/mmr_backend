const HealthProfessionalTypeService = require('../services/HealthProfessionalType.service');
const Controller = require('./Controller');
class HealthProfessionalTypeController extends Controller {
	constructor() {
		super(new HealthProfessionalTypeService(), "healthProfessionalTypes route");
	}
}

module.exports = HealthProfessionalTypeController;