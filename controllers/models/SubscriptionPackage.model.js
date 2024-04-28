const mongoose = require('mongoose');

const options = {
    title: {
        type: String,
        required: true,
        description: "Title or name of the package."
    }, 
    description: {
        type: String,
        required: true,
        description: "Description of the package."
    },
    userType: {
        type: String,
        required: true,
        description: "users who package is available for."
    },
    price: {
        type: Number,
        required: true,
        description: "must be a number"
    },
    duration:{
        type: Number,
        required: true,
        description: "must be a number (days)"
    },
    duration_text: {
        type: String,
        required: true,
        description: "must be a number days"
    },
    disabled: {
        type: Boolean,
        default: false,
        description: "must be a number days"
    },
    currency: {
        type: String,
        required: false,
        description: "must be a string"
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

const SubscriptionPackageSchema = new mongoose.Schema(options, {timestamps: true});

module.exports = mongoose.model('SubscriptionPackages', SubscriptionPackageSchema);