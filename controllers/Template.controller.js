"use strict";
const config = require("../config");
const TemplateService = require("../services/Template.service");
const Templates = require("../models/Template.model");
const StorageManager = require("../utils/Storage.manager");
const Controller = require("./Controller");

class TemplateController extends Controller {
  constructor() {
    super(new TemplateService(), "templates route");
    this.storageManager = new StorageManager();
  }
  getOne = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      const id = req.params.id;
      console.log(id);
      if (!id) {
        this.respondParamsError(res);
        return;
      }

      let response = await this.service.getOne(id);
      const thumbImage = await this.storageManager.getFileUrl(
        response.thumbImage.key
      );
      response = {
        _id: response._id,
        title: response.title,
        description: response.description,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        thumbImage: {
          ...response.thumbImage,
          url: thumbImage,
        },
        warmup: response.warmup,
        main: response.main,
        cooldown: response.cooldown,
        creator: response.creator,
        lastEditor: response.lastEditor,
      };
      res.status(200).json({
        status: 200,
        body: response,
        route: this.routeString,
      });
      return null;
    } catch (err) {
      console.log(err);
      return this.respondServerError(res);
    }
  };
  addUserTemplates = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      const body = req.body;
      const thumbImageFile = req.file;
      const folderPath = "templates/thumbnails/";
      // because of the js formData object
      let parsedBody = JSON.parse(body.data);

      // console.log(parsedBody);

      //save file to AWS S3 bucket
      const storageResponse = await this.storageManager.upload(
        thumbImageFile,
        folderPath
      );
      parsedBody = {
        ...parsedBody,
        thumbImage: { key: storageResponse.Key },
      };

      const response = await this.service.create(parsedBody);
      res.status(201).json({
        status: 201,
        body: response,
        route: this.routeString,
      });
      return null;
    } catch (error) {
      console.log(error);
      return this.respondServerError(res);
    }
  };
  getUserTemplates = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      // const user_id = req.req_user._id;
      const response = await this.service.getAll();
      res.status(200).json({
        status: 200,
        body: response,
        route: this.routeString,
      });
      return null;
    } catch (error) {
      console.log(error);
      return this.respondServerError(res);
    }
  };
  getUserTemplateCount = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      const user_id = req.req_user._id;
      const response = await this.service.getUserTemplatesCount(user_id);
      res.status(200).json({
        status: 200,
        body: {
          count: response,
        },
        route: this.routeString,
      });
      return null;
    } catch (error) {
      console.log(error);
      return this.respondServerError(res);
    }
  };
  paginateUserTemplate = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      let { page, limit } = req.query;
      if (!page) {
        page = 0;
      }
      if (!limit) {
        limit = 10;
      }
      const user_id = req.req_user._id;
      const response = await this.service.getPage(user_id, page, limit);
      res.status(200).json({
        status: 200,
        pagination: {
          page,
          limit,
        },
        body: response,
        help: "Add page and limit GET query params",
        route: this.routeString,
      });
      return null;
    } catch (err) {
      console.log(err);
      return this.respondServerError(res);
    }
  };
  getUserTemplateWithID = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      const template_id = req.params.id;
      const user_id = req.req_user._id;
      const response = await this.service.getOne(user_id, template_id);
      res.status(200).json({
        status: 200,
        body: response,
        route: this.routeString,
      });
      return null;
    } catch (err) {
      console.log(err);
      return this.respondServerError(res);
    }
  };
  addExercise = async (req, res) => {
    if (this.respondValidationError(req, res)) return;

    try {
      const _id = req.params.id;
      if (!_id) {
        return this.respondParamsError(res);
      }
      const user_id = req.req_user._id;
      const { exercise, sets, reps, time, distance, note, intensity } =
        req.body;
      const data = { exercise, sets, reps, time, distance, note, intensity };
      const response = await this.service.addExercise({ user_id, _id, data });

      return res.status(200).json({
        status: 200,
        body: {
          _id: response._id,
          warmup: response.warmup,
          main: response.main,
          cooldown: response.cooldown,
        },
        route: this.routeString,
      });
    } catch (err) {
      console.log(err);
      this.respondServerError(res);
    }
  };
  addExercises = async (req, res) => {
    if (this.respondValidationError(req, res)) return;

    try {
      const _id = req.params.id;
      if (!_id) {
        return this.respondParamsError(res);
      }
      const user_id = req.req_user._id;
      const data = req.body;
      const response = await this.service.addExercises({ user_id, _id, data });

      return res.status(200).json({
        status: 200,
        body: {
          _id: response._id,
          warmup: response.warmup,
          main: response.main,
          cooldown: response.cooldown,
        },
        route: this.routeString,
      });
    } catch (err) {
      console.log(err);
      this.respondServerError(res);
    }
  };
  //methods to get exercises for each section
  //warmup
  getWarmupExercises = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      const id = req.params.id;
      if (!id) {
        return this.respondParamsError(res);
      }
      let response = await this.service.getWarmupExercises(id);
      if (response.warmup) {
        response = await Promise.all(
          response.warmup.map(async (item) => {
            const video = item.exercise
              ? await this.storageManager.getFileUrl(item.exercise.video.key)
              : "";
            const audio = item.exercise
              ? await this.storageManager.getFileUrl(item.exercise.audio.key)
              : "";
            const thumbImage = item.exercise
              ? await this.storageManager.getFileUrl(
                  item.exercise.thumbImage.key
                )
              : "";
            const image = item.exercise
              ? await this.storageManager.getFileUrl(item.exercise.image.key)
              : "";

            const new_item = {
              sets: item.sets,
              reps: item.reps,
              time: item.time,
              distance: item.distance,
              intensity: item.intensity,
              note: item.note,
              status: item.status,
              _id: item._id,
              exercise: {
                _id: item.exercise._id,
                title: item.exercise.title,
                description: item.exercise.description,
                bodyPart: item.exercise.bodyPart,
                createdAt: item.exercise.createdAt,
                updatedAt: item.exercise.updatedAt,
                video: {
                  ...item.exercise.video,
                  url: video,
                },
                audio: {
                  ...item.exercise.audio,
                  url: audio,
                },
                thumbImage: {
                  ...item.exercise.thumbImage,
                  url: thumbImage,
                },
                image: {
                  ...item.exercise.image,
                  url: image,
                },
              },
            };

            return new_item;
          })
        );
      }
      return res.status(200).json({
        status: 200,
        body: response ?? [],
        route: this.routeString,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: 500,
        msg: "Internal server error.",
        route: this.routeString,
      });
    }
  };

  //Main
  getMainExercises = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      const id = req.params.id;
      if (!id) {
        return this.respondParamsError(res);
      }
      let response = await this.service.getMainExercises(id);
      if (response.main) {
        response = await Promise.all(
          response.main.map(async (item) => {
            const video = item.exercise
              ? await this.storageManager.getFileUrl(item.exercise.video.key)
              : "";
            const audio = item.exercise
              ? await this.storageManager.getFileUrl(item.exercise.audio.key)
              : "";
            const thumbImage = item.exercise
              ? await this.storageManager.getFileUrl(
                  item.exercise.thumbImage.key
                )
              : "";
            const image = item.exercise
              ? await this.storageManager.getFileUrl(item.exercise.image.key)
              : "";

            const new_item = {
              sets: item.sets,
              reps: item.reps,
              time: item.time,
              distance: item.distance,
              intensity: item.intensity,
              note: item.note,
              status: item.status,
              _id: item._id,
              exercise: {
                _id: item.exercise._id,
                title: item.exercise.title,
                description: item.exercise.description,
                bodyPart: item.exercise.bodyPart,
                createdAt: item.exercise.createdAt,
                updatedAt: item.exercise.updatedAt,
                video: {
                  ...item.exercise.video,
                  url: video,
                },
                audio: {
                  ...item.exercise.audio,
                  url: audio,
                },
                thumbImage: {
                  ...item.exercise.thumbImage,
                  url: thumbImage,
                },
                image: {
                  ...item.exercise.image,
                  url: image,
                },
              },
            };

            return new_item;
          })
        );
      }
      return res.status(200).json({
        status: 200,
        body: response ?? [],
        route: this.routeString,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: 500,
        msg: "Internal server error.",
        route: this.routeString,
      });
    }
  };

  //Cooldown
  getCooldownExercises = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      const id = req.params.id;
      if (!id) {
        return this.respondParamsError(res);
      }
      let response = await this.service.getWarmupExercises(id);
      if (response.cooldown) {
        response = await Promise.all(
          response.cooldown.map(async (item) => {
            const video = item.exercise
              ? await this.storageManager.getFileUrl(item.exercise.video.key)
              : "";
            const audio = item.exercise
              ? await this.storageManager.getFileUrl(item.exercise.audio.key)
              : "";
            const thumbImage = item.exercise
              ? await this.storageManager.getFileUrl(
                  item.exercise.thumbImage.key
                )
              : "";
            const image = item.exercise
              ? await this.storageManager.getFileUrl(item.exercise.image.key)
              : "";

            const new_item = {
              sets: item.sets,
              reps: item.reps,
              time: item.time,
              distance: item.distance,
              intensity: item.intensity,
              note: item.note,
              status: item.status,
              _id: item._id,
              exercise: {
                _id: item.exercise._id,
                title: item.exercise.title,
                description: item.exercise.description,
                bodyPart: item.exercise.bodyPart,
                createdAt: item.exercise.createdAt,
                updatedAt: item.exercise.updatedAt,
                video: {
                  ...item.exercise.video,
                  url: video,
                },
                audio: {
                  ...item.exercise.audio,
                  url: audio,
                },
                thumbImage: {
                  ...item.exercise.thumbImage,
                  url: thumbImage,
                },
                image: {
                  ...item.exercise.image,
                  url: image,
                },
              },
            };

            return new_item;
          })
        );
      }
      return res.status(200).json({
        status: 200,
        body: response ?? [],
        route: this.routeString,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        status: 500,
        msg: "Internal server error.",
        route: this.routeString,
      });
    }
  };
  // updateExerciseStatus = async (req, res) => {
  // 	if (this.respondValidationError(req, res))
  // 		return;
  // 	try {
  // 		const _id = req.params.id;
  // 		if (!_id) {
  // 			return this.respondParamsError(res);
  // 		}
  // 		const user_id = req.req_user._id;
  // 		const { status, patientComment } = req.body;
  // 		let response = await this.service.updateTemplateExerciseStatus({ user_id, _id, prescriptionId, status, patientComment });
  // 		response = response.filter(item => item._id.toString() === prescriptionId)
  // 		return res.status(200).json({
  // 			status: 200,
  // 			body: response[0],
  // 			route: this.routeString
  // 		});
  // 	} catch (err) {
  // 		console.log(err);
  // 		this.respondServerError(res);
  // 	}
  // }
  updateOneUserTemplate = async (req, res) => {
    if (this.respondValidationError(req, res)) return;

    try {
      const id = req.params.id;
      if (!id) {
        return this.respondParamsError(res);
      }
      const body = req.body;
      const template = await Templates.findById(id);
      const thumbImageFile = req.file;
      const folderPath = "templates/thumbnails/";
      // because of the js formData object
      let parsedBody = JSON.parse(body.data);

      if (thumbImageFile) {
        // delete previous thumbnail from AWS s3
        await this.storageManager.deleteFile(template.thumbImage.key);
        //save file to AWS S3 bucket if the user updated the thumbnail
        const storageResponse = await this.storageManager.upload(
          thumbImageFile,
          folderPath
        );
        parsedBody = {
          ...parsedBody,
          thumbImage: { key: storageResponse.Key },
        };
      }
      const user_id = req.req_user._id;
      const response = await this.service.updateOneUserTemplate(
        user_id,
        id,
        parsedBody
      );
      console.log(response);
      res.status(200).json({
        status: 200,
        body: response,
        route: this.routeString,
      });
    } catch (err) {
      console.log(err);
      this.respondServerError(res);
    }
  };
  deleteOneUserTemplate = async (req, res) => {
    if (this.respondValidationError(req, res)) return;

    try {
      const id = req.params.id;
      if (!id) {
        return this.respondParamsError(res);
      }
      const user_id = req.req_user._id;

      // get template
      const template = await Templates.findById(id);

      // delete file from AWS s3
      await this.storageManager.deleteFile(template.thumbImage.key);
      const response = await this.service.deleteOneUserTemplate(user_id, id);
      res.status(200).json({
        status: 200,
        body: {
          deleted: response,
        },
        route: this.routeString,
      });
    } catch (err) {
      console.log(err);
      this.respondServerError(res);
    }
  };
}

module.exports = TemplateController;
