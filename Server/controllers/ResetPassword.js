const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');

exports.resetPasswordToken = async(req, res) =>{
    try{
        //fetch email from body
    const email = req.body.email;
    //validate email
    const user = await User.findOne({email:email});
    if(!user){
        return res.status(400).json({
            success:false,
            message: "User is not registered with us",
        });
    }
    //generate token
    const token = crypto.randomUUID();
    //Update user by adding token and userExpiration
    const updateDetails = await User.findOne({email:email},
                                            {
                                                token : token,
                                                resetPasswordExpires:Date.now()+ 5*60*1000,
                                            },
                                            {new:true});
    //create url
    const url = `https://localhost:3000/update-password/${token}`;
    //send mail containing url
    await mailSender(email,
                        "Password Reset link",
                        `Password Reset Link${url}`);
    //return response
    return res.status(200).json({
        success:true,
        message:'Email sent Successfully, please check mail and change password',
    });
    }
    catch(error){
        ccosole.log(error);
        return res.status(400).json({
            success:false,
            message:"Something went wrong while resetting password",
        });
    }

}

//RESET PASSWORD

exports.resetPassword = async(req, res) =>{
    try{
        //Data Fetch
    const{password, confirmPassword, token} = req.body;
    //validation
    if(!password !== confirmPassword){
        return res.json({
            success:false,
            message:'Password not matching',
        });
    }
    // get userdetail from db using token
    const userDetails = await user.findOne({token: token});
    //if no entry - invalid token
    if(!userDetails){
        return res.json({
            success:false,
            message:'Token is Invalid',
        });
    }
    //token time check
    if(userDetails.resetPasswordExpires < Date.now()){
        return res.json({
            success:false,
            message:'Token is expired, Please regenerate your token',
        });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    //password update
    await User.findOne(
        {token:token},
        {password:hashedPassword},
        {new:true}
    );
    //return response
    return res.status(200).json({
        success:true,
        message:'Password Reset Successful',
    });
    }
    catch(error){
        console.log(error);
        return res.status(401).json({
            success:false,
            message:'Something went wrong while sending reset password mail'
        })
    }
}