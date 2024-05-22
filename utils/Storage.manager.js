const fs = require("fs");
const AWS = require("aws-sdk");
const config = require("../config");
const multer = require("multer");

class StorageManager {
  static storage = multer.memoryStorage({
    destination: function (req, file, cb) {
      cb(null, ""); // No destination needed as files are uploaded directly to S3
    },
  });

  static MUpload = multer({ storage: StorageManager.storage });

  constructor() {
    this.s3 = new AWS.S3({
      region: config.AWS_REGION,
      accessKeyId: config.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    });
  }

  upload = async (file, folder_path = "") => {
    // using multer memory storage
    const uploadParams = {
      Bucket: config.AWS_S3_BUCKET_NAME,
      Body: file.buffer,
      Key:
        folder_path +
        (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "dev"
          ? "test_"
          : "") +
        file.originalname,
    };
    const response = await this.s3.upload(uploadParams).promise();
    return response;
  };

  getPresignedUrl = async (key, fileType) => {
    const uploadParams = {
      Bucket: config.AWS_S3_BUCKET_NAME,
      Expires: 300, // 5 minutes
      Key: key,
      ContentType: fileType,
      ACL: "private",
    };
    const response = await this.s3.getSignedUrlPromise(
      "putObject",
      uploadParams
    );
    return response;
  };

  deleteFile = async (key) => {
    const params = {
      Key: key,
      Bucket: config.AWS_S3_BUCKET_NAME,
    };
    this.s3.deleteObject(params, (err) => {
      if (err) {
        console.log(err);
      }
    });
  };

  getFile = async (fileKey) => {
    const downloadParams = {
      Key: fileKey,
      Bucket: config.AWS_S3_BUCKET_NAME,
      Expires: 1200, // 20 minutes
    };
    return await this.s3.getObject(downloadParams).createReadStream();
  };

  getFileUrl = async (Key) => {
    try {
      const params = {
        Key,
        Expires: 3600, // 1 hour in seconds
        Bucket: config.AWS_S3_BUCKET_NAME,
      };
      const url = await this.s3.getSignedUrlPromise("getObject", params);
      return url;
    } catch (error) {
      console.error("Error generating public URL:", error);
      throw error;
    }
  };
}

module.exports = StorageManager;
