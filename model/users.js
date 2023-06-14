const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        min:5,
        max:50
    },
    email:{
        type:String,
        required:true,
        max:50,
        unique:true
    },
    password:{
        type:String,
        required:true,
        min:6,
    },
    profilePicture:{
        type:String,
        default:""
    },
    desc:{
        type:String,
        max:50
    }
},
{timestamps:true}
);

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id:this.id,username:this.username,email:this.email,desc:this.desc,profilePicture:this.profilePicture},process.env.PRIVATE_KEY)
    return token;
}

module.exports = mongoose.model("User",userSchema)