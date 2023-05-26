const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);
const path = require('path');


// const signup = require('./routes/signup');
// const login = require('./routes/login');
// const iotRoute = require('./routes/iot');
const iot = require('./routes/iot').router;
const temp = require('./routes/iot').temp;
const cb = require('./routes/iot').cb;
const databaseConnect = require('./config/database');
const dotenv = require('dotenv')
const authRouter = require('./routes/authRoute');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

dotenv.config({
    path : 'server/config/config.env'
})

app.use(bodyParser.json())
app.use(cookieParser())
app.use('/api',authRouter)

databaseConnect();

const PORT = process.env.PORT || 5000;

io.on('connection',cb)

app.use(express.static('index/dist'));
app.use(express.urlencoded({extended:false}))

//INDEX PAGE SERVER REQUESTS
app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'../index/dist','index.html'));
})

app.use('/iot',iot);


//MAIN
server.listen(PORT, ()=>{
    console.log(`Server is now running on port ${PORT}`);
})


exports.io = io;