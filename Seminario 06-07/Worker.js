var zmq = require("zeromq");  
var req = zmq.socket("req");
var carro = require("./Carro.js").Carro

req.identity='Worker1'+process.pid

req.connect('tcp://localhost:9998')

req.on('message', (c,sep,msg)=> {
    console.log("Mensaje del broker recibido")
    msg = JSON.parse(msg);
    var cart = new carro(msg["cart"]);          // Crear nuevo carro con el contenido pasado por el mensaje

    switch (msg["method"]) {                    // Realizar la operación pedida por el cliente
        case "addProduct":
            cart.addProduct(msg["product"]);
            break;
        case "removeProduct":
            cart.removeProduct(msg["product"]);
            break;
        case "close":
            cart.products = [];
            break;
        default:
            cart.getProducts()
            break;
    }
    msg["cart"] = cart.products                 // Actualizar el mensaje con el resultado de la operación
    console.log("Respuesta envíada, dueño del carrito: "+msg["client"]+" ,operación "+msg["method"]+ " ,producto "+msg["product"]);
    setTimeout(()=> {
        req.send([c,'',JSON.stringify(msg)])
    }, 2000)
})
req.send(['','',''])