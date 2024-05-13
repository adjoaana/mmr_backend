"use strict";
const config = require("../config");
const PrescriptionService = require("../services/Prescription.service");
const EmailService = require("../services/Email.service");
const PatientService = require("../services/User.service");
const Controller = require("./Controller");

class PrescriptionController extends Controller {
  constructor() {
    super(new PrescriptionService(), "prescriptions route");
    this.emailService = new EmailService();
  }

  getAllPrescriptions = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      const prescriptions = await this.service.getAllPrescriptions(
        req.req_user._id
      );
      res.status(200).json({ status: 200, body: prescriptions });
      return null;
    } catch (error) {
      console.error(error);
      return this.respondServerError(res);
    }
  };

  createPrescription = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      const {
        patientID,
        templateID,
        emailHTML = "This is a test email",
      } = req.body;
      const healthProfessionalID = req.req_user._id;
      const patientData = await new PatientService().getOne(patientID);
      const newPrescription = await this.service.createPrescription({
        patientID,
        templateID,
        healthProfessionalID,
      });

      // console.log(emailHTML);

      const createdEmail = await this.emailService.scheduleEmail({
        receiver: patientData?.email,
        receipientName: patientData?.name,
        subject: "Test email",
        message: emailHTML,
        dateTime: Date.now(),
      });

      const { _id: id } = createdEmail;

      const sentEmailStatus = await this.emailService.sendSelectedEmail(id);
      // console.log(sentEmailStatus);
      res.status(201).json({ status: 201, body: newPrescription });
      return null;
    } catch (error) {
      console.error(error);
      return this.respondServerError(res);
    }
  };

  getAllPrescriptionsForPatient = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      let patientID;
      // if user is patient, extract patientID from auth token else, check if query param was added for the patient ID
      // if yes then set patient ID to the query param value
      if (req.req_user.role === config.PATIENT_ROLE) {
        patientID = req.req_user._id;
      } else {
        if (!Boolean(req.query?.["patientID"]))
          return res.status(404).json({
            status: 404,
            message: "You must provide a valid patientID",
          });
        else {
          patientID = req.query?.patientID;
        }
      }
      const prescriptions = await this.service.getAllPrescriptionsForPatient(
        patientID
      );
      res.status(200).json({ status: 200, body: prescriptions });
    } catch (error) {
      console.error(error);
      return this.respondServerError(res);
    }
  };

  getPrescriptionDetail = async (req, res) => {
    if (this.respondValidationError(req, res)) return;
    try {
      const { prescriptionID } = req.params;
      const prescription = await this.service.getPrescriptionDetail(
        prescriptionID
      );
      if (!prescription) {
        return res
          .status(404)
          .json({ status: 404, error: "Prescription not found" });
      }
      res.status(200).json({ status: 200, body: prescription });
    } catch (error) {
      console.error(error);
      return this.respondServerError(res);
    }
  };
}

module.exports = PrescriptionController;
