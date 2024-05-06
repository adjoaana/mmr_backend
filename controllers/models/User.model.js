const mongoose = require('mongoose');
const config = require("../config");
const AuthenticationManager = require('../utils/Authentication.manager');
require("dotenv").config();
const options = {
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    emailVerified: {
        type: Boolean,
        required: true,
        default: false,
    },
    verificationToken: {
        type: String,
        description: "must be a string if the field exists"
    },
    onboarded: {
        type: Boolean,
        required: true,
        default: false,
    },
    role: {
        type: String,
        required: true,
        description: "must be a string if the field exists",
        lowercase: true,
        validate: [v =>
        ([
            config.PATIENT_ROLE,
            config.HEALTH_PROFESSIONAL_ROLE,
            config.HEALTH_FACILITY_ROLE,
            config.ORG_ROLE
        ].includes(v)
        ), `Invalid role provided. Allowed roles (${config.PATIENT_ROLE}, ${config.HEALTH_PROFESSIONAL_ROLE}, ${config.HEALTH_FACILITY_ROLE}, ${config.ORG_ROLE}). Check documentation at ${config.DOCUMENTATION_URL}`],
    },
    healthProfessionalExtraData: {
        healthProfessionalType: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "HealthProfessionalTypes",
            description: "HealthProfessionalType must be a String"
        },
        licenseNumber: {
            type: String,
            description: "licenseNumber must be a String"
        },
        licensePicture: {
            url: {
                type: String,
                description: "licensePicture.url must be a String"
            },
            key: {
                type: String,
                description: "licensePicture.key must be a String",
            },
            status: {
                type: String,
                default: "new",
                description: "licensePicture.verified must be a Boolean",
                enum: ['new', 'added', "approved", "rejected"],
            }
        },
        bio: {
            type: String,
            description: "must be a string if the field exists"
        },
        address: {
            type: String,
            description: "must be a string if the field exists"
        },
        workplace: {
            type: String,
            description: "must be a string if the field exists"
        },
        yearStarted: {
            type: Number,
            description: "must be a number if the field exists"
        }
    },
    healthFacilityExtraData: {
        bio: {
            type: String,
            description: "must be a string if the field exists"
        },
        address: {
            type: String,
            description: "must be a string if the field exists"
        },
    },
    password: {
        type: String,
        required: true,
    },
    passwordResetToken: {
        code: {
            type: String
        },
        expirationTimestamp: {
            type: Number,
        }
    },
    phone: {
        dialCode: {
            type: String,
            description: "must be a string"
        },
        number: {
            type: String,
            description: "must be a string"
        },
    },

    dob: {
        type: String,
        description: "must be a string if the field exists in the format dd/mm/yyyy"
    },
    gender: {
        type: String,
        uppercase: true,
        description: "must be a character if the field exists",
        enum: ['M', 'F', "O"]
    },
    timezone: {
        type: String,
        description: "must be a character if the field exists"
    },
    address: {
        street: {
            type: String,
            description: "must be a string if the field exists"
        },
        city: {
            type: String,
            description: "must be a string and is required",
        },
        country: {
            type: String,
            description: "must be a string and is required",
        }
    },
    preferences: {
        country: {
            type: String,
            description: "must be a string if the field exists",
            uppercase: true,
            default: "GH"
        },
        timezone: {
            type: String,
            description: "must be a number if the field exists",
            default: "Africa/Accra"
        },
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
    status: {
        type: String,
        default: "unverified",
        description: "must be a string if the field exists",
        enum: ['unverified', "verified"],
    },
    creator: {
        type: {
            type: String,
            default: "public",
        },
        id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "Users"
        }
    }
    ,
    photo: {
        url: {
            type: String,
            description: "must be a String"
        },
        key: {
            type: String,
            description: "must be a String",
            required: true
        }
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
const UserSchema = new mongoose.Schema(options,
    { timestamps: true });

UserSchema.method('genHash', function (password) {
    return AuthenticationManager.hashPassword(password);
});

UserSchema.method('isValidPassword', function (password) {
    return AuthenticationManager.comparePassword(password, this.password)
});

UserSchema.pre("save", async function (next) {
    if (this.isModified('password')) {
        this.password = this.genHash(this.password);
    }
    next();
})

module.exports = mongoose.model('Users', UserSchema);