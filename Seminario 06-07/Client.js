var zmq = require("zeromq");  
var req = zmq.socket("req");

var clientQuery = {
    "method" : process.argv[2],
    "product" :process.argv[3],
    "client" :process.argv[4]
}
req.on("message", function (message) {
    var msg = JSON.parse(message);
    console.log("Contenido del carro: "+ msg["cart"])
    process.exit(0);
});

req.connect('tcp://127.0.0.1:9999');
req.send(JSON.stringify(clientQuery));

