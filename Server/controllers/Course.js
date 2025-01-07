const Course = require('../models/Course');
const Tag = require('../models/Tags');
const User = require('../models/User');
const{uploadImageToCloudinary} = require('../utils/imageUploader');

//Create course handler function
exports.createCourse = async(req, res) =>{
    try{
        //fetch data
        const{courseName, courseDescripiton, whatYouWillLearn, price, tag} = req.body;

        //Get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescripiton || !whatYouWillLearn || !price || !tag){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        //check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("Instrutor Details:-", instructorDetails);
        //Todo Check if user id and instructor_id are same or different?

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor Details Not found',
            });
        }

        //Check Tag is valid or not
        const tagDetails = await Tag.findById(tag);

        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:'Tag Details Not found',
            });
        }

        //Upload image to cloudinary
        thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);
        
        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor : instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnail.secure_url,
        });

        //add the new course to the user schema
        await User.findByIdAndUpdate(
            {_id: instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new:true},
        );
        //Update tagSchema
        await Tag.findByIdAndUpdate(
            { _id: tagDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        );
        //HW

        //Return response
        return res.status(200).json({
            success:true,
            message: "Course created successfully",
            data: newCourse,
        });

    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
            error: error.message,
        });
    }
};

//getAllCOurses handler function

exports.showAllCourses = async(req, res) =>{
    try{
        const allCourses = await Course.find({}, {courseName:true,
                                                  price:true,
                                                  thumbnail:true,
                                                  instructor:true,
                                                  ratingAndReviews:true,
                                                  studentsEnrolled:true,})
                                                  .populate("instructor")
                                                  .exec();
        
        return res.status(200).json({
                success:true,
                message: "Data for all course fetched successfully",
                data:allCourses,
        });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:"Failed to Fetch course",
            error: error.message,
        });
    }
}