require("dotenv").config();
const mongoose = require('mongoose');
const config = require("../config");
const options = {
    video: {
       url:{
            type: String,
            description: "must be a String"
       },
       key:{
           type: String,
           required: true,
           description: "must be a String"
       }
    },
    audio: {
        url: {
            type: String,
            description: "must be a String"
        },
        key: {
            type: String,
            required: true,
            description: "must be a String"
        },
    },
    thumbImage: {
        url: {
            type: String,
            description: "must be a String"
        },
        key: {
            type: String,
            required: true,
            description: "must be a String"
        },
    },
    image: {
        url: {
            type: String,
            description: "must be a String"
        },
        key: {
            type: String,
            required: true,
            description: "must be a String"
        },
    },
    title: {
        type: String,
        required: true,
        minLength: 1,
        description: "must be a string"
    },
    description: {
        type: String,
        required: true,
        minLength: 1,
        description: "must be a string"
    },
    bodyPart: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "BodyParts"
    },
    deleted: {
        status: {
            type: Boolean,
            required: true,
            default: false,
            description: "must be a boolean if the field exists"
        },
        deletedAt: {
            type: Date,
        },
        deletedBy: {
            type: mongoose.SchemaTypes.ObjectId,
        },
    },
    creator: {
        userRole: {
            type: String,
            required: true,
            description: "This field must be a String."
        },
        admin: {
            type: mongoose.SchemaTypes.ObjectId,
            default: null,
            required () {
                return this.lastEditor.userRole === config.ADMIN_ROLE
            },
            ref: "Admins"
        },
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            default: null,
            required() {
                return this.lastEditor.userRole === config.HEALTH_PROFESSIONAL_ROLE
            },
            ref: "Users"
        },
    },
    lastEditor: {
        userRole: {
            type: String,
            required: true,
            description: "This field must be a String."
        },
        admin: {
            type: mongoose.SchemaTypes.ObjectId,
            default: null,
            required () {
                return this.lastEditor.userRole === config.ADMIN_ROLE
            },
            ref: "Admins"
        },
        user: {
            type: mongoose.SchemaTypes.ObjectId,
            default: null,
            required () {
                return this.lastEditor.userRole === config.HEALTH_PROFESSIONAL_ROLE
            },
            ref: "Users"
        },
    }
};

const ExercisesSchema = new mongoose.Schema(options, { timestamps: true });

module.exports = mongoose.model('Exercises', ExercisesSchema);