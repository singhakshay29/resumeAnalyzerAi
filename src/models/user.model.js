const mongoose = require('mongoose');

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        unique:[true,'username already exist'],
        required:true
    },
    email:{
        type:String,
        unique:[true,'Account already exist'],
        required:true
    },
    password:{
        type:String,
        required:true,
        
    }
})

const userModal=mongoose.model('user',userSchema);

module.exports = userModal;