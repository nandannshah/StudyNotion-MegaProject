const User = require('../models/User');
const Profile = require('../models/Profile');

exports.updateProfile = async(req, res) =>{
    try{
        //get data
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;
        //get userid
        const id = req.body;
        //validation
        if(!contactNumber || !gender || !id){
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }
        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        //return response
        return res.status.json({
            success:true,
            message:"Profile update successfully",
            profileDetails,
        })
    }
    catch(error){
        console.error('Error Updating profile: ', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to Update profile, please try again',
            error: error.message,
        });
    }
};

//Delete Profile
//How can we schedule this deletion operation

exports.deleteAccount = async(req, res) =>{
    try{
        //get id
        const id = req.user.id;
        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success: false,
                message: 'User not found',
                error: error.message,
            });
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //Homework how to unenroll user from all the course
        // Unenroll user from all courses
        await Course.updateMany(
            { enrolledUsers: userId },
            { $pull: { enrolledUsers: userId } }
        );
        //delete user
        await User.findByIdAndDelete({_id:id});
        //return response
    }
    catch(error){
        console.error('Error deleting profile: ', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to delete profile, please try again',
            error: error.message,
        });
    }
};

//Get user all details

exports.getUserAllDetails = async(req, res) =>{
    try{
        //get id
        const id = req.user.id;
        //validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        //return response
        return res.status(200).json({
            success:true,
            message:'User data fetched successfully',
        })
    }
    catch(error){
        console.error('Error fetching profile: ', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to fetch all details, please try again',
            error: error.message,
        });
    }
}