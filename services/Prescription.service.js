const Service = require("./Service");
const Prescription = require("../models/Prescription.model");
const TemplateModel = require("../models/Template.model");

class PrescriptionService extends Service {
  constructor() {
    super(Prescription);
  }

  getExerciseIDs = (exerciseTag, template) => {
    if (template) {
      return template[exerciseTag].map((exercise) => {
        return { exerciseID: exercise.exercise };
      });
    } else {
      throw new Error("Empty template data");
    }
  };

  createPrescription = async ({
    patientID,
    templateID,
    healthProfessionalID,
  }) => {
    const template = await TemplateModel.findOne({ _id: templateID });
    const newPrescription = new Prescription({
      patientID,
      templateID,
      healthProfessionalID,
      warmupProgress: this.getExerciseIDs("warmup", template),
      mainProgress: this.getExerciseIDs("main", template),
      cooldownProgress: this.getExerciseIDs("cooldown", template),
    });
    return await newPrescription.save();
  };

  getAllPrescriptions = async (healthProfessionalID) => {
    const response = await Prescription.find({ healthProfessionalID });
    return response;
  };

  async getAllPrescriptionsForPatient(patientID) {
    return await Prescription.find({ patientID });
  }

  async getPrescriptionDetail(prescriptionID) {
    return await Prescription.findById(prescriptionID);
  }
}

module.exports = PrescriptionService;
