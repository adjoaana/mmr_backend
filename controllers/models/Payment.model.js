const mongoose = require('mongoose');

const options = {
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: "Users"
    },
    paymentRef: {
        type: String,
        required: true,
        unique: true,
        description: "must be a string"
    },
    amount: {
        type: Number,
        required: true,
        description: "must be a number"
    },
    currency: {
        type: String,
        required: true,
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

const PaymentsSchema = new mongoose.Schema(options, {timestamps: true});

module.exports = mongoose.model('Payments', PaymentsSchema);