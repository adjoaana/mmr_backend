const Service = require("./Service");
const Templates = require("../models/Template.model");
const EmailService = require("./Email.service");
const util = require("util");
const { filter } = require("lodash");
class TemplateService extends Service {
  constructor() {
    super(Templates, "", "timestamp");
  }
  getOne = async (_id) => {
    const response = await this.Model.findOne({ _id })
      .populate("patient", "name email creator")
      .populate("healthProfessionalType", "name")
      .populate({
        path: "warmup",
        populate: {
          path: "exercise",
          model: "Exercises",
          select: "title",
        },
      })
      .populate({
        path: "main",
        populate: {
          path: "exercise",
          model: "Exercises",
          select: "title",
        },
      })
      .populate({
        path: "cooldown",
        populate: {
          path: "exercise",
          model: "Exercises",
          select: "title",
        },
      })
      .populate("healthProfessional", "name email creator");
    return response;
  };

  getOneByFilter = async (filter) => {
    const response = await this.Model.findOne(filter, this.selection)
      .populate("patient", "name email creator")
      .populate("healthProfessionalType", "name")
      .populate("warmup")
      .populate("main")
      .populate("cooldown")
      .populate("healthProfessional", "name email creator");
    return response;
  };
  getManyByFilter = async (filter) => {
    console.log("Getting all templates");
    const response = await this.Model.find(filter, this.selection)
      .populate("patient", "name email creator")
      .populate("healthProfessionalType", "name")
      .populate({
        path: "warmup",
        populate: {
          path: "exercise",
          model: "Exercises",
          select: "title",
        },
      })
      .populate({
        path: "main",
        populate: {
          path: "exercise",
          model: "Exercises",
          select: "title",
        },
      })
      .populate({
        path: "cooldown",
        populate: {
          path: "exercise",
          model: "Exercises",
          select: "title",
        },
      })
      .populate("healthProfessional", "name email creator")
      .sort(this.sort);
    return response;
  };
  getPage = async (page, limit = 10) => {
    if (page < 0 || limit < 0) return [];
    const response = await this.Model.find({}, this.selection)
      .populate("healthProfessionalType", "name")
      .populate("healthProfessional", "name email creator")
      .populate("patient", "name email creator")
      .sort(this.sort)
      .limit(limit)
      .skip(limit * page);
    return response;
  };
  async getPageByFilter(filter, page, limit = 10) {
    if (page < 0 || limit < 0) return [];

    const response = await this.Model.find(filter, this.selection)
      .populate("Template", "name description")
      .sort(this.sort)
      .limit(limit)
      .skip(limit * page);
    return response;
  }

  getAll = async () => {
    const response = await this.getManyByFilter();
    return response;
  };
  //getting exercises for each section
  getWarmupExercises = async (_id) => {
    const response = await this.Model.findOne({ _id }, "warmup")
      .populate("warmup.exercise")
      .populate({
        path: "warmup",
        populate: {
          path: "exercise",
          populate: {
            path: "bodyPart",
            model: "BodyParts",
            select: "name description",
          },
        },
      })
      .populate("warmup.exercise.bodyPart", "name description");
    return response;
  };
  getMainExercises = async (_id) => {
    const response = await this.Model.findOne({ _id }, "main")
      .populate("main.exercise")
      .populate({
        path: "main",
        populate: {
          path: "exercise",
          populate: {
            path: "bodyPart",
            model: "BodyParts",
            select: "name description",
          },
        },
      })
      .populate("main.exercise.bodyPart", "name description");
    return response;
  };
  getCooldownExercises = async (_id) => {
    const response = await this.Model.findOne({ _id }, "cooldown")
      .populate("cooldown.exercise")
      .populate({
        path: "cooldown",
        populate: {
          path: "exercise",
          populate: {
            path: "bodyPart",
            model: "BodyParts",
            select: "name description",
          },
        },
      })
      .populate("cooldown.exercise.bodyPart", "name description");
    return response;
  };
  getUserTemplates = async (user_id) => {
    const response = await this.Model.find({
      $or: [{ patient: user_id }, { healthProfessional: user_id }],
    })
      .populate("patient", "name email creator")
      .populate("healthProfessionalType", "name")
      .populate("warmup")
      .populate("main")
      .populate("cooldown")
      .populate("healthProfessional", "name email creator")
      .sort(this.sort);
    return response;
  };

  addExercise = async ({ user_id, _id, data }) => {
    const response = await this.Model.findOneAndUpdate(
      { _id, $or: [{ healthProfessional: user_id }] },
      { $push: { exercises: data } },
      { new: true, useFindAndModify: false, fields: this.selection }
    )
      .populate("warmup")
      .populate("main")
      .populate("cooldown");
    return response;
  };

  addExercises = async ({ user_id, _id, data }) => {
    const response = await this.Model.findOneAndUpdate(
      { _id, healthProfessional: user_id },
      { exercises: data },
      { new: true, useFindAndModify: false, fields: this.selection }
    )
      .populate("warmup")
      .populate("main")
      .populate("cooldown");
    return response;
  };

  updateTemplateExerciseStatus = async ({
    user_id,
    _id,
    prescriptionId,
    status,
    patientComment,
  }) => {
    const response = await this.Model.findOneAndUpdate(
      { _id, patient: user_id, "warmup._id": prescriptionId },
      {
        $set: {
          "warmup.$.status": status,
          "warmup.$.patientComment": patientComment,
        },
      },
      { new: true, fields: this.selection }
    );
    return response.exercises;
  };
  deleteOneUserTemplate = async (user_id, template_id) => {
    const result = await this.Model.deleteOne({
      _id: template_id,
      $or: [
        { patient: user_id },
        { healthProfessional: user_id },
        { "creator.admin": user_id },
      ],
    });

    return result.deletedCount ?? 0;
  };

  updateOneUserTemplate = async (user_id, _id, data) => {
    const response = await this.Model.findOneAndUpdate(
      {
        _id,
        $or: [
          { patient: user_id },
          { healthProfessional: user_id },
          { "creator.admin": user_id },
        ],
      },
      data,
      { new: true, useFindAndModify: false, fields: this.selection }
    );
    return response;
  };

  getUserTemplatesCount = async (user_id) => {
    const response = await this.Model.count({
      $or: [{ patient: user_id }, { healthProfessional: user_id }],
    });
    return response;
  };
}
module.exports = TemplateService;
