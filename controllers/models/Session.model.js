const mongoose = require('mongoose');
const config = require("../config");
const options = {
    appointment: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        unique: true,
        ref: "Appointments"
    },
    patient: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Users"
    },
    healthProfessional: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Users"
    },
    feedback: {
        patient: {
            rating: {
                type: Number,
                description: "must be a number if it exists"
            },
            note: {
                type: String,
                description: "must be a string if it exists"
            }
        },
        healthProfessional: {
            rating: {
                type: Number,
                description: "must be a number if it exists"
            },
            note: {
                type: String,
                description: "must be a string if it exists"
            }
        },
    },

    healthProfessionalType: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "HealthProfessionalTypes"
    },
    timestamp: {
        type: Number,
        required: true,
        description: "Value must be a number"
    },
    duration: {
        type: Number,
        default: 60,
        required: true,
        description: "must be a number(in minutes)"
    },
    type: {
        type: String,
        required: true,
        description: "must be a string",
        validate: [v => (["online", "physical"].includes(v)), `Invalid session type provided. Allowed types (online, physical). Check documentation at ${config.DOCUMENTATION_URL}`],
    },
    exercises: [{
        exercise: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Exercises",
        },
        sets: {
            type: Number,
            min: 0,
            description: "must be a number if it exists"
        },
        reps: {
            type: Number,
            min: 0,
            description: "must be a number if it exists"
        },
        time: {
            type: Number,
            min: 0,
            description: "must be a number (seconds) if it exists"
        },
        distance: {
            type: Number,
            min: 0,
            description: "must be a number if it exists"
        },
        intensity: {
            type: String,
            description: "must be a string if it exists"
        },
        note: {
            type: String,
            description: "must be a string if it exists"
        },
        patientComment: {
            type: String,
            description: "must be a string if it exists"
        },
        status: {
            type: String,
            default: "added",
            enum: ['added', 'completed', "viewed"],
            description: "must be a string if it exists"
        },
    }],
    diagnosis: {
        "PC": {//Presenting Complaint (PC)
            type: String,
            description: "must be a string if the field exists"
        },
        "HPC": {//History of Presenting Complaint (HPC)
            type: String,
            description: "must be a string if the field exists"
        },
        "PMHx": {//Past Medical History (PMHx) 
            type: String,
            description: "must be a string if the field exists"
        },
        "DHx": {//Drug History (DHx) 
            type: String,
            description: "must be a string if the field exists"
        },
        "FSHx": { //Family and Social History 
            type: String,
            description: "must be a string if the field exists"
        },
        "OE": {//Observation and Examination
            type: String,
            description: "must be a string if the field exists"
        },
        "investigation": {//Investigation
            type: String,
            description: "must be a string if the field exists"
        },
        "physicalDiagnosis": { //Physical Diagnosis
            type: String,
            description: "must be a string if the field exists"
        },
        "plan": {
            type: String,
            description: "must be a string if the field exists"
        },
        "note": {
            type: String,
            description: "must be a string if the field exists"
        },
        "recommendation": {
            type: String,
            description: "must be a string if the field exists"
        }
    },
    status: {
        type: String,
        default: "booked",
        require: true,
        description: "must be a string"
    },
    address: {
        street: {
            type: String,
            description: "must be a string if the field exists"
        },
        GhanaPostGPS: {
            type: String,
            description: "must be a string if it exists"
        },
        city: {
            type: String,
            description: "must be a string and is required"
        },
        country: {
            type: String,
            description: "must be a string and is required"
        }
    },
    location: {
        long: {
            type: Number,
            description: "must be a number if the field exists"
        },
        lat: {
            type: Number,
            description: "must be a number if the field exists"
        },
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

const SessionSchema = new mongoose.Schema(options, {timestamps: true});

module.exports = mongoose.model('Sessions', SessionSchema);