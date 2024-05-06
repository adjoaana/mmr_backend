"use strict";
const express = require("express");
const AuthenticationMiddleware = require("../middlewares/Authentication.middleware");
const PrescriptionController = require("../controllers/Prescription.controller");
const router = express.Router();
const config = require("../config");

// Initialize Prescription Controller
const prescriptionController = new PrescriptionController();

// @route    GET api/prescriptions/
// @desc     Get all prescriptions specific to logged in Health professional
// @access   Health Professional only
router.get(
  "/",
  AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE]),
  prescriptionController.getAllPrescriptions
);

// @route    POST api/prescriptions/
// @desc     Create new exercise prescription
// @access   Health Professional only
router.post(
  "/",
  AuthenticationMiddleware.allowed_users([config.HEALTH_PROFESSIONAL_ROLE]),
  prescriptionController.createPrescription
);

// @route    GET api/prescriptions/patients - optional query param ?patientID=
// @desc     Get all prescriptions for specific patient
// @access   Health Professionals and Patients
router.get(
  "/patients",
  AuthenticationMiddleware.allowed_users([
    config.HEALTH_PROFESSIONAL_ROLE,
    config.PATIENT_ROLE,
  ]),
  prescriptionController.getAllPrescriptionsForPatient
);

// @route    GET api/prescriptions/:prescriptionID
// @desc     Get detail for a particular prescription
// @access   Health Professionals and Patients
router.get(
  "/:prescriptionID",
  AuthenticationMiddleware.allowed_users([
    config.HEALTH_PROFESSIONAL_ROLE,
    config.PATIENT_ROLE,
  ]),
  prescriptionController.getPrescriptionDetail
);

module.exports = router;
