const instance = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmailTemplate} = require("../mail/templates/courseEnrollmentEmailTemplate");
const crypto = require('crypto');

//Cpature payment and initiate the razorpay order
exports.capturePayment = async(req, res) =>{
    //get course id and user id
    const {course_id} = req.body;
    const userId = req.user.id;
    //validation
    //valid courseId
    if(!course_id){
        return res.json({
            success:false,
            message:'Please find valid course id',
        })
    }
    //valid coursedetail
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:'Could not find the course',
            });
        }
        //user already paid for the course
        const uid = new mongoose.Types.ObjectId(userId);
        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:"Student already enrolled",
            })
        }
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
    //order create
    const amount = course.price;
    const currency = "INR";

    const options = {
        amount : amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId: course_id,
            userId,
        }
    }

    try{
        //initiate payment using razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log("Payment response->", paymentResponse);

        //return response
        return res.status(200).json({
            success:true,
            courseName: course.courseName,
            courseDescription: course.courseDescription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
        })
    }
    catch(error){
        console.error(error);
        return res.json({
            success:false,
            message:"Could not initiate order",
        })
    }
};

//Verify signature of razorpay
exports.verifySignature = async(req, res) =>{
    const webhookSecret = '1234567';

    const signature = req.headers["x-razorpay-signature"];
    //three steps to create hmac object
    //step 1
    const shasum = crypto.createHmac("sha256",webhookSecret);
    //step 2
    shasum.update(JSON.stringify(req.body));
    //step 3
    const digest = shasum.digest("hex");
    if(signature === digest){
        console.log("Payment is authorized")

        const {userId, courseId} = req.body.payload.payment.entity.notes;

        try{
            //fullfill the action
            //find the course and enroll the student
            const enrolledCourse = await Course.findOneAndUpdate(
                                                                {_id: courseId},
                                                                {$push:{studentsEnrolled: userId}},
                                                                {new:true},);
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:'Course not found',
                });
            }
            console.log(enrolledCourse);

            //find the student and add the enrolled course to student course
            const enrolledStudent = await User.findOneAndUpdate({_id:userId},
                                                                {$push:{courses: courseId}},
                                                                {new:true},);
            
            console.log(enrolledStudent);
            //Mail send krdo ab
            const emailResponse = await mailSender(enrolledStudent.email,
                                                    "Congratulaitons from code help",
                                                    "Congratulations you are enrolled in the course"
            );
            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"Signature verified course added",
            })
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"Invalid Request",
        })
    }
}