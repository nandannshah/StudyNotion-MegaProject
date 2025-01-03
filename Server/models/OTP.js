const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60,
    }
});

//Function to send email

async function sendVerificationMail(){
    try{
        const mailResponse = await mailSender(email, "Verififcation mail from StudyNotion", otp);
        console.log("Mail sent successfully ",mailResponse); 
    }
    catch(error){
        console.log("Error occur while sending mail",error)
        throw error;
    }
}

OTPSchema.pre("save", async function(next){
    await sendVerificationMail(this.email, this.otp);
    next();
})

module.exports = mongoose.model("OTP", OTPSchema);