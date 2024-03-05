const mongoose = require("mongoose");
const config = require("../config");
const options = {
  title: {
    type: String,
    required: true,
    minLength: 1,
    description: "must be a string",
  },
  description: {
    type: String,
    required: true,
    minLength: 1,
    description: "must be a string",
  },
  thumbImage: {
    url: {
      type: String,
      description: "must be a String",
    },
    key: {
      type: String,
      required: true,
      description: "must be a String",
      default: "default-exercise-template.png",
    },
  },
  warmup: [
    {
      exercise: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Exercises",
      },
      sets: {
        type: Number,
        min: 0,
        description: "must be a number if it exists",
      },
      reps: {
        type: Number,
        min: 0,
        description: "must be a number if it exists",
      },
      time: {
        type: Number,
        min: 0,
        description: "must be a number (seconds) if it exists",
      },
      distance: {
        type: Number,
        min: 0,
        description: "must be a number if it exists",
      },
      intensity: {
        type: String,
        description: "must be a string if it exists",
      },
      note: {
        type: String,
        description: "must be a string if it exists",
      },
      patientComment: {
        type: String,
        description: "must be a string if it exists",
      },
      status: {
        type: String,
        default: "added",
        enum: ["added", "completed", "viewed"],
        description: "must be a string if it exists",
      },
    },
  ],
  main: [
    {
      exercise: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Exercises",
      },
      sets: {
        type: Number,
        min: 0,
        description: "must be a number if it exists",
      },
      reps: {
        type: Number,
        min: 0,
        description: "must be a number if it exists",
      },
      time: {
        type: Number,
        min: 0,
        description: "must be a number (seconds) if it exists",
      },
      distance: {
        type: Number,
        min: 0,
        description: "must be a number if it exists",
      },
      intensity: {
        type: String,
        description: "must be a string if it exists",
      },
      note: {
        type: String,
        description: "must be a string if it exists",
      },
      patientComment: {
        type: String,
        description: "must be a string if it exists",
      },
      status: {
        type: String,
        default: "added",
        enum: ["added", "completed", "viewed"],
        description: "must be a string if it exists",
      },
    },
  ],
  cooldown: [
    {
      exercise: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Exercises",
      },
      sets: {
        type: Number,
        min: 0,
        description: "must be a number if it exists",
      },
      reps: {
        type: Number,
        min: 0,
        description: "must be a number if it exists",
      },
      time: {
        type: Number,
        min: 0,
        description: "must be a number (seconds) if it exists",
      },
      distance: {
        type: Number,
        min: 0,
        description: "must be a number if it exists",
      },
      intensity: {
        type: String,
        description: "must be a string if it exists",
      },
      note: {
        type: String,
        description: "must be a string if it exists",
      },
      patientComment: {
        type: String,
        description: "must be a string if it exists",
      },
      status: {
        type: String,
        default: "added",
        enum: ["added", "completed", "viewed"],
        description: "must be a string if it exists",
      },
    },
  ],
  patient: {
    type: mongoose.SchemaTypes.ObjectId,
    // required: true,
    ref: "Users",
  },
  healthProfessional: {
    type: mongoose.SchemaTypes.ObjectId,
    // required: true,
    ref: "Users",
  },
  healthProfessionalType: {
    type: mongoose.SchemaTypes.ObjectId,
    // required: true,
    ref: "HealthProfessionalTypes",
  },
  dateTime: {
    type: Date,
    description: "must be a date and time (timestamp)",
  },
  dateString: {
    type: String,
    description: "must be a string",
  },
  timestamp: {
    type: Number,
    required: true,
    description: "Value must be a number",
  },
  deleted: {
    status: {
      type: Boolean,
      required: true,
      default: false,
      description: "must be a boolean if the field exists",
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
      description: "This field must be a String.",
    },
    admin: {
      type: mongoose.SchemaTypes.ObjectId,
      default: null,
      required() {
        return this.lastEditor.userRole === config.ADMIN_ROLE;
      },
      ref: "Admins",
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      default: null,
      required() {
        return this.lastEditor.userRole === config.HEALTH_PROFESSIONAL_ROLE;
      },
      ref: "Users",
    },
  },
  lastEditor: {
    userRole: {
      type: String,
      required: true,
      description: "This field must be a String.",
    },
    admin: {
      type: mongoose.SchemaTypes.ObjectId,
      default: null,
      required() {
        return this.lastEditor.userRole === config.ADMIN_ROLE;
      },
      ref: "Admins",
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      default: null,
      required() {
        return this.lastEditor.userRole === config.HEALTH_PROFESSIONAL_ROLE;
      },
      ref: "Users",
    },
  },
};

const TemplatesSchema = new mongoose.Schema(options, { timestamps: true });

module.exports = mongoose.model("Templates", TemplatesSchema);
