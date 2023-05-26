const {model,Schema} = require('mongoose');

const signupSchema = new Schema({
    fName : {
        type : String,
        required : true
    },
    lName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true,
        select : false
    },
    image : {
        type : String,
        required : true
    }

 },{timestamps : true});

 module.exports = model('user',signupSchema)