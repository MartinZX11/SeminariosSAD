var zmq = require("zeromq");
var socketClient = zmq.socket("router");
var socketWorker = zmq.socket("router");

let cli = [], req = [], workers = [];
var cartPool = []


socketClient.on("message", (c,sep,m) => {
    var cartContent = []                         // Se establece el contenido del carro vacío por defecto
    m = JSON.parse(m);                           // Pasar el mensaje a obj
    var clientName = m["client"];

    if (workers.length == 0) {
        cli.push(c);
        req.push(m);
    }

    cartContent = checkCart(clientName, cartContent); // Comprobar si el cliente tiene un carrito y el contenido del mismo si lo tiene

    m["cart"] = cartContent;                         // Actualizar el contenido del carrito en el mensaje
    //console.log(m)
    socketWorker.send([workers.shift(), '', c, '', JSON.stringify(m)]);

});

socketWorker.on("message", (w,sep,c,sep2,r) => {
    if(c==''){workers.push(w); return}
    if(cli.length > 0){
        socketWorker.send([w,'',cli.shift(),'',req.shift()])
    } else {
        workers.push(w)
    }
                                                            // Actualizar datos de los carros locales con las respuestas del worker
    if (r != '') {                                          // Si hay respuesta del worker
        r = JSON.parse(r)
        var clientName = r["client"]
        for (var i = 0; i < cartPool.length; i++) {         // Buscar el carrito dentro de la pool y actualizar el estado
            if (clientName == cartPool[i]["id"]) {
                cartPool[i]["cart"] = r["cart"];
            }
        }
    }

    printCartPool();

    socketClient.send([c,'',JSON.stringify(r)])
});


function checkCart(clientName, cartContent) {
    var carro = {
        "id": clientName,
        "cart": []
    }

    var assigned = false;
    if (cartPool.length > 0) {                                  // Comprobar si assignedn carritos
        for (var i = 0; i < cartPool.length; i++) {             // Buscar el carrito asociado al cliente
            if (clientName == cartPool[i]["id"]) {
                console.log("El cliente "+clientName+" ya tiene un carrito asociado")
                assigned = true;
                cartContent = cartPool[i]["cart"];              // Recuperar contenido
            }
        }
        if (assigned == false) {                                  // Si no tiene un carrito asociado se mete en la pool
            cartPool.push(carro)
            assigned = false;
        }
    } else {
        console.log("No hay carritos")     // Si no hay carritos ponerlo meterlo directamente en la pool
        cartPool.push(carro)
    }

    return cartContent;
}

function printCartPool() {
    console.log("*Pool de carritos*")
    for (var i = 0; i < cartPool.length; i++) {
        console.log("Dueño del carrito: " + cartPool[i]["id"] + " ,productos del carrito: " + cartPool[i]["cart"]+ "\n")
    }
}



socketClient.bind("tcp://*:9999", function (err) {
    if (err) {
        console.log("Error in connection 9999");
    }else {
        console.log("Client connected to port 9999")
    }
});

socketWorker.bind("tcp://*:9998", function (err) {
    if (err) {
        console.log("Error in connection 9998");
    }else {
        console.log("Worker connected to port 9998")
    }
});


