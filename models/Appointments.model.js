const mongoose = require('mongoose');

const options = {
    patient: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Users"
    },
    healthProfessionalType: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "HealthProfessionalTypes"
    },
    healthProfessional: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Users"
    },
    dateTime: {
        type: Date,
        description: "must be a date and time (timestamp)"
    },
    dateString: {
        type: String,
        description: "must be a string"
    },
    timestamp: {
        type: Number,
        required: true,
        description: "must be a timestamp"
    },
    type: {
        type: String,
        default: "online",
        description: "must be a string"
    },
    approval: {
        admin: { type: mongoose.SchemaTypes.ObjectId, ref: "Admins" },
        healthProfessional: { type: mongoose.SchemaTypes.ObjectId, ref: "Users" }
    },
    status: {
        type: String,
        default: "pending",
        description: "must be a string"
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
};

const AppointmentsSchema = new mongoose.Schema(options, {timestamps: true});

module.exports = mongoose.model('Appointments', AppointmentsSchema);