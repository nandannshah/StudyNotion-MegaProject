const Section = require('../models/Section');
const SubSection = require('../models/SubSection');
const {uploadImageToCloudinary} = require('../utils/imageUploader');

exports.createSubSection = async(req, res) =>{
    try{
        //fetch data from req body
        const {sectionId, title, timeDuration, description} = req.body;
        //extract file video
        const video = req.file.videoFile;
        //validation
        if( !sectionId || !title || ! timeDuration || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are mandatory',
            })
        }
        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        //create a sub section
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration: timeDuration,
            description: description,
            videoUrl:uploadDetails.secure_url,
        })
        //update section with this sub section object id
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
                                                                {
                                                                    $push:{
                                                                        subSection:SubSectionDetails._id,
                                                                    }
                                                                },
                                                                {new:true})
                                                                .populate({
                                                                    path: 'courseContent', // Populates sections
                                                                    populate: {
                                                                        path: 'subsections', // Populates subsections within sections
                                                                    },
                                                                });
                                                                //Log updated section here , after adding populate query
        //return response
        return res.status(200).json({
            success:true,
            message:'Sub section created successfully',
            updatedSection,
        })

    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: "Unable to create section, please try again",
            error: error.message,
        });
    }
};


//HW updateSubSection
exports.updateSubSection = async (req, res) => {
    try {
        // Fetch data from req body
        const { subSectionId, title, timeDuration, description } = req.body;

        // Extract video file if provided
        const video = req.file?.videoFile;

        // Find the subsection to update
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: 'Subsection not found',
            });
        }

        // Upload new video if provided
        if (video) {
            const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
            subSection.videoUrl = uploadDetails.secure_url;
        }

        // Update the fields
        if (title) subSection.title = title;
        if (timeDuration) subSection.timeDuration = timeDuration;
        if (description) subSection.description = description;

        // Save the updated subsection
        const updatedSubSection = await subSection.save();

        // Return response
        return res.status(200).json({
            success: true,
            message: 'Subsection updated successfully',
            updatedSubSection,
        });

    } catch (error) {
        console.error('Error updating subsection:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to update subsection, please try again',
            error: error.message,
        });
    }
};


//HW deleteSubSection

exports.deleteSubSection = async (req, res) => {
    try {
        // Fetch subsection ID from req body
        const { subSectionId, sectionId } = req.body;

        // Validate IDs
        if (!subSectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: 'subSectionId and sectionId are required',
            });
        }

        // Find and delete the subsection
        const subSection = await SubSection.findByIdAndDelete(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: 'Subsection not found',
            });
        }

        // Remove the subsection reference from the section
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            { $pull: { subSection: subSectionId } },
            { new: true }
        ).populate('subSection'); // Optional: Populate remaining subsections

        // Return response
        return res.status(200).json({
            success: true,
            message: 'Subsection deleted successfully',
            updatedSection,
        });

    } catch (error) {
        console.error('Error deleting subsection:', error);
        return res.status(500).json({
            success: false,
            message: 'Unable to delete subsection, please try again',
            error: error.message,
        });
    }
};