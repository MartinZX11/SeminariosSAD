var mgdb=require('mongodb');
var mongoclient = mgdb.MongoClient;
var conn;
var db = require('./dm.js');
var url='mongodb://localhost:27017';

const express = require("express");
const app = express();

mongoclient.connect(url,function (err,cliente) {
  if(err){
    console.log("Ha ocurrido un error al conectarse a la base de datos");
  }
  conn = cliente;
});

app.listen(3000, () => {
  console.log("Escucha de peticiones REST en el puerto 3000");
 });

app.get('/listarProductos', function (req, res) {
  console.log("Haciendo petición para saber los productos existentes");
  db.listarProductos( conn, 
    result => {
      res.send(result);
    }
  );
});

app.get('/listarCarrito', function (req, res) {
  var user = req.query.user;
  console.log("Haciendo petición para saber el carrito del usuario " + user);
  if(!user){
    res.status(500).send('Debes introducir el parámetro usuario! (tip: /listarCarrito?user=X) donde X es el id del usuario');
  }
  else{
    db.listarCarrito( conn, user,
      result => {
        res.send(result);
      }
    );
  }
});

app.get('/addProductoAlCarrito', function (req, res) {
  var user = req.query.user;
  var idProducto = Number(req.query.idProducto);
  console.log("Añadiendo el producto " + idProducto + " al carrito del usuario " + user);
  if(!user || !idProducto){
    res.status(500).send('Debes introducir el parámetro usuario e id del producto! (tip: /añadirProductoAlCarrito?user=X&idProducto=Y) donde X es el id del usuario e Y el id del producto');
  }
  else{
    db.añadirProductoAlCarrito( conn, idProducto, user,
      result => {
        if(!result){
          res.send("Se añadió el producto al carro!");
          console.log("Se añadió el producto al carro!");
        }else{
          res.status(500).send('Algo fue mal al introducir el producto al carrito: ' + result);
        }
      }
    );
  }
});

app.delete('/productoAlCarrito', function (req, res) {
  var user = req.query.user;
  var idProducto = Number(req.query.idProducto);
  console.log("Quitando el producto " + idProducto + " al carrito del usuario " + user);
  if(!user || !idProducto){
    res.status(500).send('Debes introducir el parámetro usuario e id del producto! (tip: /productoAlCarrito?user=X&idProducto=Y) donde X es el id del usuario e Y el id del producto');
  }
  else{
    db.quitarProductoAlCarrito( conn, idProducto, user,
      result => {
        if(!result){
          res.send("Se quitó el producto al carro!");
          console.log("Se quitó el producto al carro!");
        }else{
          res.status(500).send('Algo fue mal al quitar el producto al carrito: ' + result);
        }
      }
    );
  }
});

