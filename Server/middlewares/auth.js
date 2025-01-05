const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');


exports.auth = async(req, res, next) =>{
    try{
        const token = req.cookies.token
                    || req.token.body
                    || req.header("Authorisation").replace("Bearer", "");


        //If token is missing
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is missing",
            });
        }

        //Verify the token

        try{
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(error){
            //Verification issue
            return res.status(401).json({
                success:false,
                message:"Token is invalid",
            });

        }
        next(); 

    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Something went wrong while validating the token",
        });

    }
}

//isStudent

exports.isStudent = async(req, res, next) =>{
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message: "This is Protected route for Student",
            });
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"User role cannot verified, Please try again",
        });
    }
}

//isInstructor

exports.isInstructor = async(req, res, next) =>{
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message: "This is Protected route for Instructor",
            });
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"User role cannot verified, Please try again",
        });
    }
}

//isAdmin
exports.isAdmin = async(req, res, next) =>{
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message: "This is Protected route for Admin",
            });
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"User role cannot verified, Please try again",
        });
    }
}