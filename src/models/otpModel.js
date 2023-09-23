const {Schema, model } = require('mongoose');

const OTPSchema = new Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    otp:{
        type:String
    },
    createdAt:Date,
    expiresAt:Date
})

const OTP = model('OTP', OTPSchema);
module.exports = OTP;