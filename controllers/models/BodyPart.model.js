const mongoose = require('mongoose');

const options = {
    name: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
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
            ref: "Admins"
        },
    },
};

const BodyPartSchema = new mongoose.Schema(options, {timestamps: true});

module.exports = mongoose.model('BodyParts', BodyPartSchema);