require("dotenv").config();

const config = {
	APP_NAME: "MonitorMyRehab",
	PEM_PATH: "ecdsa-p521-private.pem",
	PUB_PATH: "ecdsa-p521-public.pem",
	PHYSIO_ROLE: "pro",
	HEALTH_PROFESSIONAL_ROLE: "pro",
	PATIENT_ROLE: "ind",
	HEALTH_FACILITY_ROLE: "clinic",
	ORG_ROLE: "org",
	ADMIN_ROLE: "admin",
	LIVE_HOST_URL: process.env.LIVE_HOST_URL,
	PORT: process.env.PORT,
	HOST_URL: process.env.HOST_URL,
	HOST_FILE_URL: process.env.HOST_FILE_URL,
	DB_URL1: process.env.DB_URL1,
	DB_URL: process.env.DB_URL,
	DOCUMENTATION_URL: process.env.DOCUMENTATION_URL,
	JWT_SECRET: process.env.JWT_SECRET,
	AWS_ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
	AWS_REGION: process.env.REGION,
	AWS_S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
}

module.exports = config;