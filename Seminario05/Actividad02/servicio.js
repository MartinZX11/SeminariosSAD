var mgdb=require('mongodb');
var mongoclient = mgdb.MongoClient;
var conn;
var db = require('./dm.js');
var url='mongodb://localhost:27017';

//User is an integer
var user = process.argv[2];
if(isNaN(user)){
  console.error("El número de usuario es incorrecto!");
  process.exit(1);
}
var cmd = process.argv[3];
var args = process.argv[4] == null ? '' : JSON.parse(process.argv[4]);

mongoclient.connect(url,function (err,cliente) {
  if(err){
    console.log("Ha ocurrido un error al conectarse a la base de datos");
  }
  conn = cliente;
  send(cmd);
});

function send(cmd){
  switch(cmd){
    case 'listarProductos':
      db.listarProductos( conn, 
        result => {
          console.log(result);
          process.exit(1);
        }
      );
    break;
    case 'listarCarrito':
      db.listarCarrito( conn, user,
        result => {
          console.log(result);
          process.exit(1);
        }
      );
    break;
    case 'añadirProductoAlCarrito':
      db.añadirProductoAlCarrito( conn, args[0], user,
        result => {
          if(!result){
            console.log("Se añadió el producto al carro!");
          }
          process.exit(1);
        }
      );
    break;
    case 'quitarProductoAlCarrito':
      db.quitarProductoAlCarrito( conn, args[0], user,
        result => {
          if(!result){
            console.log("Se quitó el producto del carro!");
          }
          process.exit(1);
        }
      );
    break;
  }
}

