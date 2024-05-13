const Emails = require("../models/Email.model");

const nodemailer = require("nodemailer");
const Service = require("./Service");
const SettingsService = require("./Settings.service");
const config = require("../config");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

class EmailService extends Service {
  constructor() {
    super(Emails);
    this.sender = this.#emailConfig?.auth?.user ?? "admin@monitormyrehab.com";
  }
  #emailConfig = {
    tls: {
      ciphers: "SSLv3",
    },
  };

  scheduleEmail = async ({
    receiver,
    receipientName,
    subject,
    message,
    dateTime,
  }) => {
    const email = {
      recipient_email: receiver,
      receipient_name: receipientName,
      subject,
      body: message,
      delivered: false,
      sendTime: dateTime,
    };
    return this.create(email);
  };

  sendSelectedEmail = async (id) => {
    const emailToBeSent = await this.getOneByFilter({
      delivered: false,
      _id: id,
    });
    this.#sendSavedEmails(emailToBeSent);
  };

  sendDueScheduledEmails = async () => {
    const scheduledEmails = this.getManyByFilter({
      sendTime: { $lte: Date.now() + 600000 /*6 munites in the future*/ },
      delivered: false,
    });
    for (let index = 0; index < scheduledEmails.length; index++) {
      const email = scheduledEmails[index];
      this.#sendSavedEmails(email);
    }
  };

  // add method to send emails immediately
  sendFailedScheduledEmails = async () => {
    const scheduledEmails = this.getManyByFilter({
      sendTime: { $lt: Date.now() },
      delivered: false,
    });
    for (let index = 0; index < scheduledEmails.length; index++) {
      const email = scheduledEmails[index];
      this.#sendSavedEmails(email);
    }
  };

  #sendSavedEmails = async (email) => {
    // console.log("Received email", email);
    this.sendEmailWithSendinblueAPI({
      receiver: email.recipient_email,
      receiver_name: email.receipient_name,
      subject: email.subject,
      body1: email.body,
      success_cb: () => {
        this.updateOne(email._id, { delivered: true });
      },
    });
  };
  sendEmailWithSendinblueAPI = async ({
    receiver,
    receiver_name = "",
    subject,
    subject2,
    body1,
    body2,
    action,
    success_cb = () => {
      /*empty to prevent null calls*/
    },
    failure_cb = () => {
      /*empty to prevent null calls*/
    },
  }) => {
    const settings = await new SettingsService().get();
    const SENDINBLUE_API_URL = settings.email.API_URL;
    const SENDINBLUE_API_KEY = settings.email.API_KEY;
    try {
      const res = await fetch(SENDINBLUE_API_URL, {
        headers: {
          "api-key": SENDINBLUE_API_KEY,
          accept: "application/json",
          "content-type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          sender: {
            name: "MonitorMyRehab",
            email: settings.email.SMTP_USER,
          },
          to: [
            {
              email: receiver,
              name: receiver_name.split(" ")[0],
            },
          ],
          subject,
          templateId: 1, // default template
          params: {
            SUBJECT: subject,
            SUBJECT2: subject2 ?? "",
            NAME: receiver_name ?? "",
            BODY: body1,
            BODY2: body2 ?? "",
            ACTION_LINK: action?.link ?? "https://monitormyrehab.com/",
            ACTION_TITLE: action?.title ?? "Open App",
          },
        }),
      });
      //   console.log(res);
      if (res.status === 201) {
        success_cb();
        return true;
      } else {
        console.log("Failed to send email.");
      }
    } catch (err) {
      console.log(err);
      failure_cb();
      return false;
    }
  };
  scheduleEmailWithSendinblueAPI = async ({
    receiver,
    receiver_name,
    subject,
    subject2,
    body1,
    body2,
    action,
    scheduledAt = new Date().toISOString(),
    success_cb = () => {
      /*empty to prevent null calls*/
    },
    failure_cb = () => {
      /*empty to prevent null calls*/
    },
  }) => {
    const settings = await new SettingsService().get();
    const SENDINBLUE_API_URL = settings.email.API_URL;
    const SENDINBLUE_API_KEY = settings.email.API_KEY;
    try {
      const res = await fetch(SENDINBLUE_API_URL, {
        headers: {
          "api-key": SENDINBLUE_API_KEY,
          accept: "application/json",
          "content-type": "application/json",
        },
        method: "POST",
        body: {
          sender: {
            name: "MonitorMyRehab",
            email: settings.email.SMTP_USER,
          },
          to: [
            {
              email: receiver,
              name: receiver_name.split(" ")[0] ?? "",
            },
          ],
          subject,
          templateId: 1, // default template
          params: {
            SUBJECT: subject,
            SUBJECT2: subject2 ?? "",
            NAME: receiver_name ?? "",
            BODY: body1,
            BODY2: body2,
            ACTION_LINK: action?.link ?? "https://monitormyrehab.com/",
            ACTION_TITLE: action?.title ?? "Open Web App",
          },
          scheduledAt,
        },
      });
      if (res.status === 202) {
        success_cb();
        return true;
      }
    } catch (err) {
      console.log(err);
      failure_cb();
      return false;
    }
  };

  sendPasswordReset = async ({ email, passwordResetToken, user }) => {
    const response = await this.sendEmailWithSendinblueAPI({
      receiver: email,
      receiver_name: user?.name ?? "",
      subject: "Password Reset Request",
      subject2: "Requested password reset.",
      body1:
        "Follow the link below to reset your password. Link is valid for only 1 hour.",
      action: {
        link: `${config.LIVE_HOST_URL}password_reset/${passwordResetToken}`,
        title: "Reset Password",
      },
    });
    return response;
  };

  sendAppointmentRequestConfirmation = async ({ email, user }) => {
    const response = await this.sendEmailWithSendinblueAPI({
      receiver: email,
      receiver_name: user?.name ?? "",
      subject: "Appointment Requested Successfully",
      subject2: "About your recent appointment request",
      body1:
        "Your will be notified when there is a change in your request. Your would usually get a response in less than 24 hours.",
      body2: "You can also view the status of your request at link below",
      action: {
        link: `${config.LIVE_HOST_URL}appointments/`,
        title: "Open Appointments",
      },
    });
    return response;
  };

  sendAppointmentRequestApproval = async (email, name = "") => {
    const response = await this.sendEmailWithSendinblueAPI({
      receiver: email,
      receiver_name: name,
      subject: "Recent Appointment",
      subject2: "About your recent appointment request",
      body1: "Good News!",
      body2:
        "Your appointment has been approved. A session has been created for you. You can also view the status of your request at link below.",
      action: {
        link: `${config.LIVE_HOST_URL}appointments/`,
        title: "Open Appointments",
      },
    });
    return response;
  };

  sendAppointmentRequestApprovalProfessional = async (email, name = "") => {
    const response = await this.sendEmailWithSendinblueAPI({
      receiver: email,
      receiver_name: name.split(" ")[0],
      subject: "Session Created",
      subject2: "Notification of session.",
      body1:
        "An appointment has been approved for a patient with you. A session has been created with you.",
      body2: "You can also view this here.",
      action: {
        link: `${config.LIVE_HOST_URL}sessions/`,
        title: "Open Sessions",
      },
    });
    return response;
  };

  sendAppointmentRequestDenied = async ({ email, user }) => {
    const response = await this.sendEmailWithSendinblueAPI({
      receiver: email,
      receiver_name: user?.name ?? "",
      subject: "Recent Appointment",
      subject2: "About your recent appointment request",
      body1:
        "Sorry your appointment has been denied. The admin will contact you soon with available times.",
      body2: "You can also view the status of your request at link below",
      action: {
        link: `${config.LIVE_HOST_URL}appointments/`,
        title: "Open Appointments",
      },
    });
    return response;
  };

  sendLicenseApproval = async ({ email, name }) => {
    const response = await this.sendEmailWithSendinblueAPI({
      receiver: email,
      receiver_name: name ?? "",
      subject: "Update on license",
      subject2: "License Approved",
      body1:
        "Your license has been approved. You can now use all features of the application.",
      body2: "Thank you.",
      action: {
        link: `${config.LIVE_HOST_URL}`,
        title: "Open App",
      },
    });
    return response;
  };

  sendLicenseRejection = async ({ email, name, reason = "" }) => {
    const response = await this.sendEmailWithSendinblueAPI({
      receiver: email,
      receiver_name: name ?? "",
      subject: "Update on license",
      subject2: "License Rejected",
      body1:
        "Your license has been rejected. See the reason and upload a different image of your license.",
      body2: `Reason: ${reason}`,
      action: {
        link: `${config.LIVE_HOST_URL}`,
        title: "Open App",
      },
    });
    return response;
  };

  scheduleSessionReminder = async ({ email, session_id, timestamp, user }) => {
    const dateTime = new Date(timestamp).toLocaleString();
    const response = await this.scheduleEmailWithSendinblueAPI({
      receiver: email,
      receiver_name: user?.name ?? "",
      subject: "Upcoming Session",
      subject2: "Session Reminder",
      body1: `You have a session at ${dateTime}. You can also view the status of your request at link below`,
      action: {
        link: `${config.LIVE_HOST_URL}sessions/${session_id}`,
        title: "Open Session",
      },
      scheduledAt: new Date(timestamp - 3600000).toISOString(), // minus 60 minutes
    });
    return response;
  };

  sendWelcomeMessage = async (name = "", email) => {
    const response = await this.sendEmailWithSendinblueAPI({
      receiver: email,
      receiver_name: name,
      subject: "Welcome to MonitorMyRehab",
      subject2: "The New Therapy Experience",
      body1:
        "Login to your new account to begin your journey to better theraphy healthcare services from top rated therapist.",
      action: {
        link: `${config.LIVE_HOST_URL}login`,
        title: "Login here",
      },
    });
    return response;
  };

  sendVerifyEmail = async (name = "", email, verificationToken) => {
    const response = await this.sendEmailWithSendinblueAPI({
      receiver: email,
      receiver_name: name,
      subject: "Verify your email",
      subject2: "Welcome",
      body1:
        "Thank you for joining monitorMyRehab. You need to verify your email to complete your registration.",
      body2: "Please click the button below to verify your account.",
      action: {
        link: `${config.LIVE_HOST_URL}verify_email/${verificationToken}`,
        title: "Verify your email",
      },
    });
    return response;
  };

  #validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
}

module.exports = EmailService;
