const mongoose = require('mongoose');

const options = {
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Users"

    },
    payment: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Payments",
        unique: true
    },
    package: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "SubscriptionPackages"
    },
    startTimestamp: {
        type: Number,
        required: true,
        description: "must be a number (timestamp)"
    },
    endTimestamp: {
        type: Number,
        required: true,
        description: "must be a number (timestamp)"
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

const SubscriptionSchema = new mongoose.Schema(options, {timestamps: true});

module.exports = mongoose.model('Subscriptions', SubscriptionSchema);