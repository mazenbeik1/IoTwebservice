const mongoose = require('mongoose')

const databaseConnect = ()=>{
    mongoose.connect(process.env.DATABASE_URL,{
        useNewUrlParser : true ,
        useUnifiedTopology :true
    }).then(()=>{
        console.log('----------------------------------------------------------------------MongoDB Databse Connected');
    }).catch(err=>{
        console.log('----------------------------------------------------------------------Databse Error ' + err);
    })
}
module.exports = databaseConnect;