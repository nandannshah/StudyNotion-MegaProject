const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();

exports.sendOTP = async (req, res)=>{
    try{
        //Fetch email from request ki body
        const{email} = req.body;
        
        //Check if user already exist
        const checkUserPresent = await User.findOne({email});

        if(checkUserPresent){
            res.status(401).json({
                success:false,
                message:'User Already Resgistered',

            });
        }


        //Generate OTP
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        console.log("OTP generated", otp);

        //Check otp unique or not
        let result = await OTP.findOne({otp:otp});

        const otpPayload = {email, otp};

        //create an entry for otp
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //Return response succesful
        res.status(200).json({
            success:true,
            message:'OTP sent successfully',
        });


    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

//SignUP function

exports.signUp = async(req, res) =>{
    try{
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;
        //Validate karo
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                succcess:false,
                message:"All fields are required",
            });
        }

        //dono password match kro
        if(password != confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirm passwprd do not match",
            });
        }

        //Check If user already exist
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exist",
            });
        }

        //Find most recent otp for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        //Validate ott
        if(recentOtp.length() == 0){
            //OTP not found
            return res.status(400).json({
                success:false,
                message:'OTP not found',
            });
        }else if(otp !== recentOtp.otp){
            //Invadlid otp
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }

        //Hash password

        const hashedPassword = await bcrypt.hash(password, 10);

        //Entry create in db

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });
        //return res
        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again ",
        })
    }
};

//Login

exports.login = async(req, res) =>{
    try{
        const {email , password} = req.body;
        //Validatiaon of data

        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required. Please try again",
            });
        }

        //USer check if exist or not
        const user = await User.findOne({email}).populate('additionalDetails');
        if(!user){
            return res.status(401).json({
                success:false,
                message: "User is not registered. Please signup first",
            })
        }

        //Password match
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email: user.email,
                id : user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn:"2h",
            });

            user.token = token;
            user.password = undefined;

            //Cookie generate krdo
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message: "Logged in Succesfully"
            });
        }else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect",
            })
        }

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login Failure. Please try again",
        })
    }
};


//Change Password
exports.changePassword = async(req, res) =>{
    try{
        const {email, password} = req.body;

    

    }   
    catch(error){

    } 
}