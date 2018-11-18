let express = require('express')
let path = require('path')
let bodyParser = require('body-parser')
let rooting = require('./roots/rooting.js')
let functions = require('./other/functions.js')
let redis = require('redis')
var db = redis.createClient()

let api = express()
let server = require('http').createServer(api);
let io = require('socket.io')(server);


api.use(express.static(path.join(__dirname, '/public')));
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));

//ROOTS
rooting(api);

//INIT CLASS
functions = new functions();

let clientsList = [];

//SOCKET.IO
io.on('connection', function(client) {

    client.on('join', function(pathname) {
        client.join(pathname);
        
        let color = functions.color;
        
        client.emit('client_params', {client_id: client.id, 
                                      color: color,
                                     others_clients: clientsList});
        
        
        clientsList.push(color); 
        io.to(pathname).emit('new_client', {client_id: client.id, 
                                            color: color, 
                                            pathname: pathname});
        
    });

    client.on('leave', function(data) {
        
        client.leave(data.pathname);
        
        clientsList.splice(clientsList.indexOf(data.color), 1);
        
        io.to(data.pathname).emit('client_leave', {client_id: client.id, 
                                            color: data.color, 
                                            pathname: data.pathname});
        
    });
    
    client.on('new_entry', function(message) {
        
        io.to(message.pathname).emit('new_message', {new_message: message.text, color: message.color});
    });
});

//DB
db.on('connect', function() {
    console.log('connected to db');
});

server = server.listen(3000, function () {
    console.log("Our API is running on port number ", server.address().port);
});




//let getList = (a) => {
//    
//    return new Promise((resolve, reject) => {
//        
//        if(a > 0)
//            resolve('positif');
//        else reject('negatif');
//    })
//}
//
//getList(-2).then((res)=>{
//    
//    console.log(res);
//}).catch((e)=>{
//    
//    console.error(e);
//})