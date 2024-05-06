const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require("dotenv").config();

const options = {
    name: {
        type: String,
        required: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        default: "",
        description: "must be a character if the field exists"
    },
    status: {
        type: String,
        default: "active",
        description: "must be a string if the field exists"
    },
    photo: {
        url: {
            type: String,
            description: "must be a String"
        },
        key: {
            type: String,
            required: true,
            description: "must be a String"
        },
        fileType: {
            type: String,
            description: "must be a String"
        }
    },
    passwordResetToken: {
        code: {
            type: String
        },
        expirationTimestamp: {
            type: Number,
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

const AdminSchema = new mongoose.Schema(options,
    { timestamps: true });

AdminSchema.method('genHash', function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
});

AdminSchema.method('isValidPassword', function (password) {
    return bcrypt.compareSync(password, this.password);
});

AdminSchema.pre("save", async function(next) {
    if (this.isModified('password')) {
        this.password = this.genHash(this.password);
    }
    next();
})

module.exports = mongoose.model('Admins', AdminSchema);