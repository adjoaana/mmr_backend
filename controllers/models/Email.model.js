const mongoose = require('mongoose');

const options = {
    recipient_email: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    delivered: {
        type: Boolean,
        default: true,
        required: true,
    },
    sendTime: {
        type: Number,
        default: Date.now(),
        required: true,
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

const EmailSchema = new mongoose.Schema(options,
{timestamps: true});

module.exports = mongoose.model('Emails', EmailSchema);