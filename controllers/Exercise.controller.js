require("dotenv").config();
const config = require("../config");
const ExerciseMiddleware = require("../middlewares/Exercise.middleware");
const ExerciseService = require("../services/Exercise.service");
const StorageManager = require("../utils/Storage.manager");
const Controller = require("./Controller");

class ExerciseController extends Controller {
  constructor() {
    super(new ExerciseService(), "exercises route");
    this.storageManager = new StorageManager();
  }

  getOne = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      const id = req.params.id;
      if (!id) {
        this.respondParamsError(res);
        return;
      }

      let response = await this.service.getOne(id);

      const video = await this.storageManager.getFileUrl(response.video.key);
      const audio = await this.storageManager.getFileUrl(response.audio.key);
      const thumbImage = await this.storageManager.getFileUrl(
        response.thumbImage.key
      );
      const image = await this.storageManager.getFileUrl(response.image.key);
      response = {
        _id: response._id,
        title: response.title,
        bodyPart: response.bodyPart,
        description: response.description,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        video: {
          ...response.video,
          url: video,
        },
        audio: {
          ...response.audio,
          url: audio,
        },
        thumbImage: {
          ...response.thumbImage,
          url: thumbImage,
        },
        image: {
          ...response.image,
          url: image,
        },
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
  get = async (req, res) => {
    console.log("IN hereee");
    if (this.respondValidationError(req, res)) return;
    try {
      let { query } = req.query;
      if (!query) {
        query = "";
      }

      query = query.replace(/[^0-9a-z]/gi, ""); // clean query
      const regExp = new RegExp(query, "i");

      let response = await this.service.getManyByFilter({ title: regExp });

      response = await Promise.all(
        response.map(async (item) => {
          const video = await this.storageManager.getFileUrl(item.video.key);
          const audio = await this.storageManager.getFileUrl(item.audio.key);
          const thumbImage = await this.storageManager.getFileUrl(
            item.thumbImage.key
          );
          const image = await this.storageManager.getFileUrl(item.image.key);
          const new_item = {
            _id: item._id,
            title: item.title,
            bodyPart: item.bodyPart,
            description: item.description,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            video: {
              ...item.video,
              url: video,
            },
            audio: {
              ...item.audio,
              url: audio,
            },
            thumbImage: {
              ...item.thumbImage,
              url: thumbImage,
            },
            image: {
              ...item.image,
              url: image,
            },
          };
          return new_item;
        })
      );

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

  paginate = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      let { page, limit, query, bodyPart } = req.query;
      if (!page) {
        page = 0;
      }
      if (!limit) {
        limit = 10;
      }
      if (!query) {
        query = "";
      }

      // clean query
      query = query.replace(/[^0-9a-z]/gi, "");
      const regExp = new RegExp(query, "i");
      const filter = {
        title: regExp,
      };
      if (bodyPart) {
        filter.bodyPart = bodyPart;
      }

      let response = await this.service.getPageByFilter(filter, page, limit);
      const pages = await this.service.count({ title: regExp });

      response = await Promise.all(
        response.map(async (item) => {
          const video = await this.storageManager.getFileUrl(item.video.key);
          const audio = await this.storageManager.getFileUrl(item.audio.key);
          const thumbImage = await this.storageManager.getFileUrl(
            item.thumbImage.key
          );
          const image = await this.storageManager.getFileUrl(item.image.key);
          const new_item = {
            _id: item._id,
            title: item.title,
            bodyPart: item.bodyPart,
            description: item.description,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            video: {
              ...item.video,
              url: video,
            },
            audio: {
              ...item.audio,
              url: audio,
            },
            thumbImage: {
              ...item.thumbImage,
              url: thumbImage,
            },
            image: {
              ...item.image,
              url: image,
            },
          };
          return new_item;
        })
      );
      res.status(200).json({
        status: 200,
        pagination: {
          page,
          limit,
          pages: Math.ceil(pages / limit),
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

  addOne = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      req.body.creator = {
        userRole: req.req_user.role,
      };
      req.body.lastEditor = {
        userRole: req.req_user.role,
      };
      if (req.req_user.role === config.ADMIN_ROLE) {
        req.body.creator.admin = req.req_user._id;
        req.body.lastEditor.admin = req.req_user._id;
      } else {
        req.body.creator.user = req.req_user._id;
        req.body.lastEditor.user = req.req_user._id;
      }
      const timestamp = Date.now();
      req.body.image = {
        key: `${req.body.title.replaceAll(" ", "_")}_image_${timestamp}`,
      };
      req.body.thumbImage = {
        key: `${req.body.title.replaceAll(" ", "_")}_thumbImage_${timestamp}`,
      };
      req.body.audio = {
        key: `${req.body.title.replaceAll(" ", "_")}_audio_${timestamp}`,
      };
      req.body.video = {
        key: `${req.body.title.replaceAll(" ", "_")}_video_${timestamp}`,
      };
      return this.add(req, res);
    } catch (err) {
      console.log(err);
      return this.respondServerError(res);
    }
  };

  addOneWithText = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      req.body.creator = {
        userRole: req.req_user.role,
      };
      req.body.lastEditor = {
        userRole: req.req_user.role,
      };
      if (req.req_user.role === config.ADMIN_ROLE) {
        req.body.creator.admin = req.req_user._id;
        req.body.lastEditor.admin = req.req_user._id;
      } else {
        req.body.creator.user = req.req_user._id;
        req.body.lastEditor.user = req.req_user._id;
      }
      const timestamp = Date.now();
      req.body.image = {
        key: `${req.body.title.replaceAll(" ", "_")}_image_${timestamp}`,
      };
      req.body.thumbImage = {
        key: `${req.body.title.replaceAll(" ", "_")}_thumbImage_${timestamp}`,
      };
      req.body.audio = {
        key: `${req.body.title.replaceAll(" ", "_")}_audio_${timestamp}`,
      };
      req.body.video = {
        key: `${req.body.title.replaceAll(" ", "_")}_video_${timestamp}`,
      };

      return this.add(req, res);
    } catch (err) {
      console.log(err);
      return this.respondServerError(res);
    }
  };

  updateOne = async (req, res) => {
    if (this.respondValidationError(req, res)) return;

    req.body.lastEditor = {
      userRole: req.req_user.role,
    };
    if (req.req_user.role === config.ADMIN_ROLE) {
      req.body.lastEditor.admin = req.req_user._id;
    } else {
      req.body.lastEditor.user = req.req_user._id;
    }

    try {
      const id = req.params.id;
      if (!id) {
        this.respondParamsError(res);
        return;
      }
      const body = req.body;
      const response = await this.service.updateOne(id, body);
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

  deleteOne = async (req, res) => {
    if (this.respondValidationError(req, res)) return;

    try {
      const id = req.params.id;
      if (!id) {
        this.respondParamsError(res);
        return;
      }
      const exercise = await this.service.getOne(id);
      const response = await this.service.deleteOne(id);

      this.storageManager.deleteFile(exercise.image.key);
      this.storageManager.deleteFile(exercise.thumbImage.key);
      this.storageManager.deleteFile(exercise.audio.key);
      this.storageManager.deleteFile(exercise.video.key);

      res.status(200).json({
        status: 200,
        body: {
          deleted: response,
        },
        route: this.routeString,
      });
      return null;
    } catch (err) {
      console.log(err);
      return this.respondServerError(res);
    }
  };

  validate(method) {
    switch (method) {
      case "update": {
        return ExerciseMiddleware.update_validate();
      }
    }
  }
}

module.exports = ExerciseController;
