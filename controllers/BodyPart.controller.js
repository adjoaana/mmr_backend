const BodyPartService = require('../services/BodyPart.service');
const Controller = require('./Controller');
class BodyPartController extends Controller {
	constructor() {
		super(new BodyPartService(), "BodyParts route");
	}
}

module.exports = BodyPartController;