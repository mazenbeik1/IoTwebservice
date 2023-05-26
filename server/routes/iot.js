const express = require('express');
const router = express.Router();
const path = require('path');
var mqtt = require('mqtt');
const formidable= require('formidable');
const io = require('../app.js');
let doorLogs=[];
let temp='0';

var options = {
    host: 'a670c703f1934b36ad47d8ea8d073aa4.s2.eu.hivemq.cloud',
    port: 8883,
    protocol: 'mqtts',
    username: 'Server',
    password: 'MZmZServer'
}

let bedroomLEDBrightness=10;
let bedroomLEDMode = '2';
let livingroomLEDBrightness=10;
let livingroomLEDMode = '2';
let RGBLEDMode = '2';
let RLEDBrightness=10;
let GLEDBrightness=10;
let BLEDBrightness = 10;
let sockets=[];
// initialize the MQTT client
var client = mqtt.connect(options);

let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const cb = async (socket) => {
    var address = socket.handshake.address;
    sockets.push(socket);
    
    await sleep(100);

    socket.emit('Temp',temp);
    await sleep(100);
    socket.emit('bedroomLEDBrightness',parseInt(bedroomLEDBrightness));
    await sleep(100);
    socket.emit('bedroomLEDMode',bedroomLEDMode);
    await sleep(100);
    socket.emit('livingroomLEDBrightness',parseInt(livingroomLEDBrightness));
    await sleep(100);
    socket.emit('livingroomLEDMode',livingroomLEDMode);
    await sleep(100);
    
    socket.emit('RGBLEDMode',RGBLEDMode);
    await sleep(100);
    socket.emit('RLEDBrightness',parseInt(RLEDBrightness));
    await sleep(100);
    socket.emit('GLEDBrightness',parseInt(GLEDBrightness));
    await sleep(100);
    socket.emit('BLEDBrightness',parseInt(BLEDBrightness));
    await sleep(100);

    doorLogs.map(log=>{
        socket.emit(log.state,log.time);
    })
    // socket.on('LEDBrigtness',(msg)=>{
    //     client.publish('LEDBrigtness',msg);
    //     brightness = parseInt(msg);
    //     console.log('brightness message recieved');
    //     sockets.map(socket =>{
    //         socket.emit('LEDBrightness',msg);
    //     })
    // })

    // socket.on('LEDMode',(msg)=>{
    //     client.publish('LEDMode',msg);
    //     mode = msg.toString();
    //     sockets.map(socket =>{
    //         socket.emit('LEDMode',mode);
    //     })
    // })

    socket.on('livingroomLEDBrightness',(msg)=>{
        client.publish('livingroomLEDBrightness',msg.toString());
        livingroomLEDBrightness = parseInt(msg);
        console.log('LIVING ROOM LED BRIGHTNESS');
        sockets.map(socket =>{
            socket.emit('livingroomLEDBrightness',livingroomLEDBrightness);
        })
    })

    socket.on('livingroomLEDMode',(msg)=>{
        client.publish('livingroomLEDMode',msg);

        console.log("LIVING ROOM LED MODE")
        livingroomLEDMode = msg.toString();
        sockets.map(socket =>{
            socket.emit('livingroomLEDMode',livingroomLEDMode);
        })
    })

    socket.on('bedroomLEDBrightness',(msg)=>{
        client.publish('bedroomLEDBrightness',msg.toString());
        bedroomLEDBrightness = parseInt(msg);
        console.log('bedrooooooooooooom brightness message recieved');
        sockets.map(socket =>{
            socket.emit('bedroomLEDBrightness',bedroomLEDBrightness);
        })
    })

    socket.on('bedroomLEDMode',(msg)=>{
        client.publish('bedroomLEDMode',msg);
        console.log("bedroom LEDMode recieved")
        bedroomLEDMode = msg.toString();
        sockets.map(socket =>{
            socket.emit('bedroomLEDMode',bedroomLEDMode);
        })
    })

    socket.on('RGBLEDMode',(msg)=>{
        client.publish('RGBLEDMode',msg);
        RGBLEDMode = parseInt(msg);
        console.log('mode message recieved');
        sockets.map(socket =>{
            socket.emit('RGBLEDMode',msg);
        })
    })

    socket.on('RLEDBrightness',(msg)=>{
        client.publish('RLEDBrightness',msg.toString());
        console.log("RLED RECIEVED")
        RLEDBrightness = parseInt(msg);
        sockets.map(socket =>{
            socket.emit('RLEDBrightness',RLEDBrightness);
        })
    })

    socket.on('GLEDBrightness',(msg)=>{
        client.publish('GLEDBrightness',msg.toString());
        GLEDBrightness = parseInt(msg);
        console.log('GLED RECIEVED');
        sockets.map(socket =>{
            socket.emit('GLEDBrightness',GLEDBrightness);
        })
    })

    socket.on('BLEDBrightness',(msg)=>{
        client.publish('BLEDBrightness',msg.toString());
        console.log("BLED RECIEVED")
        BLEDBrightness =parseInt(msg);
        sockets.map(socket =>{
            socket.emit('BLEDBrightness',BLEDBrightness);
        })
    })

    socket.on('disconnect',function(){
        // console.log('user disconnected')
        sockets = sockets.filter((disconnectedSocket)=>{
            socket != disconnectedSocket;
        })
    })
}

// io.on('connection',function(socket){
//     console.log("new user connected")

//     socket.on('disconnect',function(){
//         console.log('user disconnected')
//     })
// })


// setup the callbacks
client.subscribe('bedroomLEDBrightness');
client.subscribe('bedroomLEDMode');
client.subscribe('livingroomLEDBrightness');
client.subscribe('livingroomLEDMode');
client.subscribe('RGBLEDMode');
client.subscribe('RLEDBrightness');
client.subscribe('GLEDBrightness');
client.subscribe('BLEDBrightness');


client.subscribe('Door');
client.subscribe('Temp');


client.on('connect', function () {
    console.log('connected to MQTT')
});

client.on('error', function (error) {
    console.log(error);
});

client.on('message', function (topic, message) {
    // called each time a message is received
    console.log('Received message:', topic, message.toString());
    if(topic == 'Temp'){
        temp = message.toString();
        console.log('Temp message recieved');
        sockets.map(socket =>{
            socket.emit(topic,temp);
        })
    } else if(topic == 'bedroomLEDBrightness'){
        bedroomLEDBrightness = parseInt(message);
        console.log('brightness message recieved');
        sockets.map(socket =>{
            socket.emit('bedroomLEDBrightness',bedroomLEDBrightness);
        })
    }else if(topic == 'bedroomLEDMode'){
        console.log('mode message recieved');
        bedroomLEDMode = message.toString();
        sockets.map(socket =>{
            socket.emit('bedroomLEDMode',bedroomLEDMode);
        })
    }else if(topic == 'livingroomLEDBrightness'){
        livingroomLEDBrightness = parseInt(message);
        console.log('brightness message recieved');
        sockets.map(socket =>{
            socket.emit('livingroomLEDBrightness',livingroomLEDBrightness);
        })
    }else if(topic == 'livingroomLEDMode'){
        console.log('mode message recieved');
        livingroomLEDMode = message.toString();
        sockets.map(socket =>{
            socket.emit('livingroomLEDMode',livingroomLEDMode);
        })
    }else if(topic == 'RLEDBrightness'){
        RLEDBrightness = parseInt(message);
        console.log('brightness message recieved');
        sockets.map(socket =>{
            socket.emit('LED',RLEDBrightness);
        })
    }else if(topic == 'GLEDBrightness'){
        GLEDBrightness = parseInt(message);
        console.log('brightness message recieved');
        sockets.map(socket =>{
            socket.emit('GLEDBrightness',GLEDBrightness);
        })
    }else if(topic == 'BLEDBrightness'){
        BLEDBrightness = parseInt(message);
        console.log('brightness message recieved');
        sockets.map(socket =>{
            socket.emit('BLEDBrightness',BLEDBrightness);
        })
    }else if(topic == 'RGBLEDMode'){
        console.log('mode message recieved');
        RGBLEDMode = message.toString();
        sockets.map(socket =>{
            socket.emit('RGBLEDMode',RGBLEDMode);
        })
    }else if(topic == 'Door'){
        let msg = message.toString();
        if(msg == '0'){
            lastOpened = new Date(Date.now());
            doorLogs.push({state: 'doorOpened', time: new Date(Date.now())})
            console.log(lastOpened)
            sockets.map(socket =>{
                socket.emit('doorOpened',lastOpened);
            })
        } else if(msg == '1'){
            lastClosed = new Date(Date.now());
            doorLogs.push({state: 'doorClosed', time: new Date(Date.now())})
            sockets.map(socket =>{
                socket.emit('doorClosed',lastClosed);
            })

        }
    }
});

// subscribe to topic 'my/test/topic'

// // publish message 'Hello' to topic 'my/test/topic'
// client.publish('LED', 'Hello');

// router.get('/',(req,res)=>{
//     res.sendFile(path.resolve(__dirname,'../../index/build','index.html'));
// })

// router.get('/lights',(req,res)=>{
//     res.send('request recieved');
//     // console.log('request recieved : ' + req.body);
// })

// router.post('/lights',(req,res)=>{
//     // console.log(req);
//     const form = formidable();
//     form.parse(req,async(err,fields,files)=>{
//         client.publish('LEDMode', fields.mode.toString());
//         client.publish('LED', fields.brightness.toString());
//         console.log(fields)
//     })
//     // client.publish('LED', mode);
// })

module.exports = {router,temp,cb};