const mongoose=require("mongoose");
const schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");
const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    username: { // Explicitly define username
        type: String
    }
});

// Use .default if the package is imported as an object in modern Node.js
userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose);
const User=mongoose.model("User",userSchema);

module.exports=User;