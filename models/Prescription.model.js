const mongoose = require("mongoose");

const options = {
  patientID: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Users",
  },
  templateID: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Templates",
  },
  healthProfessionalID: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "Users",
  },
  datePrescribed: { type: Date, default: Date.now },
  warmupProgress: [
    {
      exerciseID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Exercises",
      },
      videoDurationWatched: { type: Number, default: 0 }, // in seconds
      isCompleted: { type: Boolean, default: false },
    },
  ],
  mainProgress: [{
    exerciseID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Exercises",
    },
    videoDurationWatched: { type: Number, default: 0 }, // in seconds
    isCompleted: { type: Boolean, default: false },
  },],
  cooldownProgress: [{
    exerciseID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Exercises",
    },
    videoDurationWatched: { type: Number, default: 0 }, // in seconds
    isCompleted: { type: Boolean, default: false },
  },],
};

const PrescriptionsSchema = new mongoose.Schema(options, { timestamps: true });

module.exports = mongoose.model("Prescriptions", PrescriptionsSchema);
