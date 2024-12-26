const mongoose = require('mongoose');
require('dotenv').config();

exports.dbConnect = () => {
    mongoose.connect({})
    .then(()=> {console.log("DB connected successfully")})
    .catch((error)=>{
        console.log("Db connnection Failed");
        console.error(error);
        process.exit(1);
    })
};