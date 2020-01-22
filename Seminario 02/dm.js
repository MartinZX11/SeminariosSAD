 var mgdb=require('mongodb');
 var assert = require('assert');

const dbName = 'tienda';

function insert(conn, nameCollection, object, cb){
  const col = conn.db(dbName).collection(nameCollection);
  col.insert(object, function(err, result){
    assert.equal(err, null);
    if(!err){
      cb(result);
    }
  });
}

function remove(conn, nameCollection, query, cb){
  const col = conn.db(dbName).collection(nameCollection);
  col.deleteOne(query, function(err, obj){
    if(err){
      console.error(err);
    }
    else{
      cb();
    }
  });
}

function find(conn, nameCollection, query, cb){
  const col = conn.db(dbName).collection(nameCollection);
  col.find(query).toArray(function(err, result) {
    if(err){console.log("Could not retrieve any register: " + err);}
    else{
      cb(result);
    }
  });
}

function update(conn, nameCollection, query, newValues, cb){
  const col = conn.db(dbName).collection(nameCollection);
  col.updateOne(query, newValues, function(err, result) {
    if(err){console.log("Could not update any register: " + err);}
    else{
      cb();
    }
  });
}

exports.listarProductos = function (conn, cb) {
  find(conn, "productos", {}, 
  productos => {
      cb(productos);
  });
}

exports.listarCarrito = function (conn, user, cb) {
  find(conn, "carrito", {user: { $eq: user }}, 
  productos => {
      if(productos.length != 0){
        cb(productos);
      }
  });
}

exports.añadirProductoAlCarrito = function (conn, idProducto, user, cb) {
  find(conn, "productos", { id: { $eq: idProducto } }, 
  producto => {
      if(producto.length == 0){
        console.error("No se ha encontrado el producto!");
        cb(-1);
      }
      else{
        if(producto[0].qty == 0){
          console.error("No quedan productos en stock!");
          cb(-1);
        }
        else{
          date = new Date();
          insert(conn, "carrito", {"user":user,"id":idProducto,"date":date},
          result =>
            {
              newQTY = producto[0].qty - 1;
              update(conn, "productos", { id: { $eq: idProducto } }, {$set: {qty: newQTY}}, 
              result => {
                cb();
              })
            });
        }
      }
  });
}

exports.quitarProductoAlCarrito = function (conn, idProducto, user, cb) {
  find(conn, "carrito", { id: { $eq: idProducto },  user: { $eq: user }}, 
  productos => {
      if(productos.length == 0){
        console.log("No se ha encontrado el producto en el carrito!");
        cb(-1);
      }
      else{
        remove(conn, "carrito", { id: { $eq: idProducto },  user: { $eq: user }},
          result => {
            find(conn, "productos", { id: { $eq: idProducto }},
            producto => {
              newQTY = producto[0].qty + 1;
              update(conn, "productos", { id: { $eq: idProducto }}, { $set: {qty: newQTY} }, result => {cb();})
            });
          });
      }
  });
}


