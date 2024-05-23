import mongoose from 'mongoose';

const Schema = new mongoose.Schema({ 
    name: { type: String, required: true }, 
    email: { type: String, required: true },
    password: { type: String, required: true },
    otp: { type: String, required: true },
    admin:{ type:Boolean},
    invalidOTPAttempts: { type: Number, default: 0 } // New field to track invalid OTP attempts
}, { timestamps: true });

export const formSchema = mongoose.model('Form', Schema);