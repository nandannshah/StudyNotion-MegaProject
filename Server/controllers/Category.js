const Category = require('../models/Category')
exports.createCategory = async(req, res) =>{
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

        const categoryDetails = await Tag.create({
            name: name,
            description: description,
        });
        console.log("tagdetails", categoryDetails);

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

exports.showAllCategories = async(req, res) =>{
    try{
        const allTags = await Category.find({}, {naem:true, description:true});

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