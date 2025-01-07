const Tag = require('../models/Tags');

exports.createTag = async(req, res) =>{
    try{
        //Data fetch karo
        const{name, description} = req.body;
        //Validate
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All fields are mandatory',
            });
        }

        const tagDetails = await Tag.create({
            name: name,
            description: description,
        });
        console.log("tagdetails", tagDetails);

        return res.status(200).json({
            success:true,
            message:"Tag created successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message: error.message,
        });
    }
};


//GEtall Tags

exports.showAllTags = async(req, res) =>{
    try{
        const allTags = await Tags.find({}, {naem:true, description:true});

        return res.status(200).json({
            success: true,
            message: "All tags returned successfully",
            allTags,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message: error.message,
        });
    }
}