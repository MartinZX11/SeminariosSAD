var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

  var identified=false;
  var nickname;

  socket.emit('chat message', "A user connected, tell us your Nickname");
  socket.emit('getusers', users);                                             // Pintar los usuarios conectados

  socket.on('disconnect', function(){
    var delIndex = users.indexOf(nickname);
    users.splice(delIndex,1);
    console.log('user disconnected');
    io.emit('chat message', "User "+nickname+" is disconnected");
    io.emit('removeUser', nickname);                                        // Eliminar al usuario de la lista de usuarios conectados
  });

  socket.on('chat message', function(msg){
    if (!identified){                                                 // Comprobar si el usuario está identificado y almacenarlo en el array de usuarios
      if (!users.includes(msg)) {
        users.push(msg)   
        console.log(users.toString())
        identified = true;
        nickname = msg
        io.emit('chat message', "User "+nickname+" is connected");
        io.emit('usernames', nickname +"\n");                       // Añadir usuario a la lista de usuarios conectados
      } else {
        socket.emit('chat message', "User "+msg+" already has taken");
      }
    } else {
      console.log('message: ' + msg);
      //io.emit('chat message', nickname + ": " + msg);              // Enviar a todos incluyendo al que escribe el mensaje
      socket.broadcast.emit('chat message', nickname + ": " + msg);  // Enviar a todos menos al que escribe el mensaje
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
