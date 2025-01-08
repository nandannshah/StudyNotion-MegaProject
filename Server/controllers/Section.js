const Section = require('../models/Section');
const Course = require('../models/Course');

exports.createSection = async(req, res) =>{
    try{
        //data Fetch
        const {sectionName, courseId} = req.body;
        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }
        //create section
        const newSection = await Section.create({sectionName});
        //update course with sectionObject ID
        const updateCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                },
            },
            { new: true }
        )
        .populate({
            path: 'courseContent', // Populates sections
            populate: {
                path: 'subsections', // Populates subsections within sections
            },
        });
        //HW use populate to replace sections/subsections both in the updatedcoursedetails
        //return response
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updateCourseDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create section please try again",
            error:error.message,
        });
    }
};

//Update section

exports.updateSection = async(req, res) =>{
    try{
        //data input 
        const{sectionName, sectionId} = req.body;
        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});
        //return res
        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
            updateCourseDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to Update section please try again",
            error:error.message,
        });
    }
};

exports.deleteSection = async(req, res) =>{
    try{
        //getID
        const {sectionId} = req.params;
        //use findByIDand Delete
        await Section.findByIdAndDelete({sectionId});
        //TODO Do we need to delete entry from course schema?
        //return response
        return res.status(200).json({
            success:true,
            message: "Section deleted successfully",
        }); 
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete section please try again",
            error:error.message,
        });
    }
};