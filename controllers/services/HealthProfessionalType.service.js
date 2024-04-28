const Service = require('./Service');
const HealthProfessionalTypes = require("../models/HealthProfessionalType.model");

class HealthProfessionalTypeService extends Service {
	constructor() {
		super(HealthProfessionalTypes, "-userCreator");
	};
}

module.exports = HealthProfessionalTypeService;