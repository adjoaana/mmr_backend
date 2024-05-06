const serverless = require("serverless-http");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const UsersRoute = require("./routes/User.route");
const AdminRoute = require("./routes/Admin.route");
const SettingsRoute = require("./routes/Settings.route");
const HealthProfessionalTypeRoute = require("./routes/HealthProfessionalType.route");
const BodyPartRoute = require("./routes/BodyPart.route");
const SessionRoute = require("./routes/Session.route");
const StorageRoute = require("./routes/Storage.route");
const SubscriptionPackageRoute = require("./routes/SubscriptionPackage.route");
const SubscriptionRoute = require("./routes/Subscription.route");
const PaymentRoute = require("./routes/Payment.route");
const ExerciseRoute = require("./routes/Exercise.route");
const TemplateRoute = require("./routes/Template.route");
const AppointmentRoute = require("./routes/Appointment.route");
const PrescriptionRoute = require("./routes/Prescription.route");
const SecurityManager = require("./controllers/SecurityManager.controller");
const bodyParser = require("body-parser");
const config = require("./config");

const StorageManager = require("./utils/Storage.manager");
const InstallationManager = require("./utils/Installation");
const AutomationManager = require("./utils/Automation.manager");
const AppointmentService = require("./services/Appointment.service");

const app = express();
app.use(express.json());
app.use(cors());

const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,
}; //ssl: process.env.NODE_ENV === "prod" ? true : false};

if (process.env.NODE_ENV !== "test") {
  //   console.log(config);
  mongoose.set("strictQuery", false);
  mongoose.connect(config.DB_URL, dbOptions, (err) => {
    if (err) console.log(err);
    else {
      console.log("mongdb is connected");
      InstallationManager.initializeSetup();

      // Register Automated tasks
      console.log("set up automated tasks");
      const automationManager = new AutomationManager();
      const appointmentService = new AppointmentService();
      automationManager.registerTask(
        30,
        appointmentService.rejectOverdueAppointments()
      );

      // Start tasks
      automationManager.initilizeTasks();
      console.log("start tasks");
    }
  });
  app.use(
    morgan(
      'mmr - [:date[clf]] :remote-addr - :remote-user  ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
    )
  ); // common | combined
}

app.use("/", SecurityManager.check_allowed_requests);
app.get("/file/:key", async (req, res) => {
  const { key } = req.params;
  if (!key) {
    res.status(404).send("File not found");
  }
  const url = await new StorageManager().getFileUrl(key);
  res.status(200).redirect(url);
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create necesary configurations for application
app.use("/api/exercises", ExerciseRoute);
app.use("/api/appointments", AppointmentRoute);
app.use("/api/sessions", SessionRoute);
app.use("/api/bodyParts", BodyPartRoute);
app.use("/api/healthProfessionalTypes", HealthProfessionalTypeRoute);
app.use("/api/users", UsersRoute);
app.use("/api/subscriptionPackages", SubscriptionPackageRoute);
app.use("/api/subscriptions", SubscriptionRoute);
app.use("/api/payments", PaymentRoute);
app.use("/api/admins", AdminRoute);
app.use("/api/settings", SettingsRoute);
app.use("/api/storage/", StorageRoute);
app.use("/api/templates", TemplateRoute);
app.use("/api/prescriptions", PrescriptionRoute);

app.get("/file/:key", async (req, res) => {
  const { key } = req.params;
  if (!key) {
    res.status(404).send("File not found");
  }
  const url = await new StorageManager().getFileUrl(key);
  res.status(200).redirect(url);
});

// Welcome message
app.get("/", (req, res) => {
  res.json({
    route: "MonitorMyRehab API",
    message:
      "Hello there. Are you on aws or where are you?\nThis is the monitorMyRehab API version 1.0.0",
  });
});

app.post("*", (req, res) => {
  res.status(404).json({ message: "Endpoint not supported", status: 404 });
});
app.put("*", (req, res) => {
  res.status(404).json({ message: "Endpoint not supported", status: 404 });
});
app.delete("*", (req, res) => {
  res.status(404).json({ message: "Endpoint not supported", status: 404 });
});

//const PORT = process.env.NODE_ENV === "test" ? Number.parseInt(config.PORT) + 1 : config.PORT;

if (process.env.NODE_ENV === "dev") {
  app.listen(5001, () => {
    console.log("Listening on port 5001");
  });
}
if (process.env.NODE_ENV !== "test") {
  console.log("serverless app exported");
  module.exports.handler = serverless(app);
} else {
  console.log("Just app exported");
  module.exports = app;
}
// mongodb+srv://mmr-dev:Dd9IJn63o0nQOrBh@mmr-test.lhe7vep.mongodb.net/?retryWrites=true
