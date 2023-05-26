const formidable = require('formidable');
const validator = require('validator');
const signupModel = require('../models/authModel');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.userSignup = (req,res) =>{

    const form = formidable();
    form.parse(req, async(err,fields,files)=>{
        const {fName,lName,email,password,confirmPassword} = fields;
        const {image} = files;
        const error = [];

        if(!fName){error.push('fName required')}
        if(!lName){error.push('lName required')}
        if(!email){error.push('email required')}
        if(email && !validator.isEmail(email)){error.push('unvalid email')}
        if(!password){error.push('password required')}
        if(!confirmPassword){error.push('confirm password required')}
        if(password && confirmPassword && (password!==confirmPassword)){error.push("password !== confirm password")}
        if(Object.keys(files).length === 0){error.push('image required')}
        if(error.length > 0){
            res.status(400).json({
                error:{
                    errorMessage : error
                }
            })
        } else{
            const imageName = files.image.originalFilename;
            const randNum = Math.floor(Math.random() * 100000);
            const newImageName = randNum + imageName;

            files.image.originalFilename = newImageName;

            const newPath = __dirname + `../../../index/public/images/profileImages/${files.image.originalFilename}`

            try{
                const checkUser = await signupModel.findOne({
                    email: email
                })

                if(checkUser){
                    res.status(400).json({
                        error: {
                            errorMessage : ['email already exists']
                        }
                    })
                }else{
                    fs.copyFile(files.image.filepath,newPath, async(err)=>{
                        if(!err){
                            const createUser = await signupModel.create({
                                fName,
                                lName,
                                email,
                                password: await bcrypt.hash(password,10),
                                image: files.image.originalFilename
                            })


                            const token = jwt.sign({
                                id : createUser._id,
                                email : createUser.email,
                                username : createUser.fName,
                                image: createUser.image,
                                regTime : createUser.createdAt
                            }, process.env.SECRET,{
                                expiresIn: process.env.TOKEN_EXP
                            });

                            const options = {expires : new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000)}
                            res.status(201).cookie('authToken',token,options).json({
                                successMessage : 'registration complete', 
                                token
                            })
        
                            console.log('registration complete')
                            console.log(token)
                            

                        }else {
                            res.status(500).json({
                                error: {
                                    errorMessage : ['Internal Server Error']
                                }
                            })
                        }
                    })
                }
            } catch(err){
                res.status(500).json({
                    error: {
                        errorMessage : ['Internal Server Error']
                    }
                })
            }
        }
    })
    // console.log('register is working')
    // console.log(req)
}


module.exports.userLogin = async (req,res) =>{
    const error = [];
    const {email, password} = req.body;
    if(!email){error.push('email required')}
    if(email && !validator.isEmail(email)){error.push('unvalid email')}
    if(!password){error.push('password required')}
    if(error.length > 0){
        res.status(400).json({
            error:{
                errorMessage  : error
            }
        })
    }else{
        try{
            const checkUser = await signupModel.findOne({
                email:email
            }).select('+password');

            if(checkUser){
                const matchPassword = await bcrypt.compare(password, checkUser.password);
                if(matchPassword){
                    const token = jwt.sign({
                        id : checkUser._id,
                        email : checkUser.email,
                        username : checkUser.fName,
                        image: checkUser.image,
                        regTime : checkUser.createdAt
                    }, process.env.SECRET,{
                        expiresIn: process.env.TOKEN_EXP
                    });

                    const options = {expires : new Date(Date.now() + process.env.COOKIE_EXP * 24 * 60 * 60 * 1000)}
                    res.status(200).cookie('authToken',token,options).json({
                        successMessage : 'login complete', 
                        token
                    })
                }else {
                    res.status(400).json({
                        error:{
                            errorMessage: ['Wrong password']
                        }
                    })
                }
            }else{
                res.status(400).json({
                    error:{
                        errorMessage: ['email not found']
                    }
                })
            }
        }catch{
            res.status(404).json({
                error:{
                    errorMessage: ['internal server error']
                }
            })
        }
    }
    console.log(req.body)
}