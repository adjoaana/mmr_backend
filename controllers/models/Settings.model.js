const mongoose = require('mongoose');

const options = {
    payment: {
        paystack: {
            PAYSTACK_SECRET: {
                type: String,
                default: "",
                description: "must be a string"
            },
            PAYSTACK_PUBLIC_KEY: {
                type: String,
                default: "",
                description: "must be a string"
            },
        }
    },
    email: {
        API_KEY:{
            type: String,
            default: "",
            description: "must be a string"
        },
        API_URL: {
            type: String,
            default: "",
            description: "must be a string"
        },
        SMTP_HOST: {
            type: String,
            default: "",
            description: "must be a string"
        },
        SMTP_PORT: {
            type: Number,
            default: 0,
            description: "must be a number"
        },
        SMTP_USER: {
            type: String,
            default: "",
            description: "must be a string"
        },
        SMTP_PASS: {
            type: String,
            default: "",
            description: "must be a string"
        }
    }

};

const SettingsSchema = new mongoose.Schema(options, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);