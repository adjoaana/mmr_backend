const Service = require('./Service');
const BodyParts = require("../models/BodyPart.model");

class BodyPartService extends Service {
	constructor() {
		super(BodyParts, "-userCreator");
	};
}

module.exports = BodyPartService;