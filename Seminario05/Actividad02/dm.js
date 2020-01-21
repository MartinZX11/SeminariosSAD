 var mgdb=require('mongodb');
 var assert = require('assert');

const dbName = 'tienda';

function insert(conn, nameCollection, object){
  return new Promise(function(resolve, reject) {
  const col = conn.db(dbName).collection(nameCollection);
  col.insert(object, function(err, result){
    assert.equal(err, null);
    if(!err){
      resolve(result);
    }
  });
})
}

function remove(conn, nameCollection, query){
  return new Promise(function(resolve, reject) {
  const col = conn.db(dbName).collection(nameCollection);
  col.deleteOne(query, function(err, obj){
    if(err){
      reject(console.error(err));
    }
    else{
      resolve();
    }
  });
})
}

function find(conn, nameCollection, query){
  return new Promise(function(resolve, reject) {
  const col = conn.db(dbName).collection(nameCollection);
  col.find(query).toArray(function(err, result) {
    if(err){reject(console.log("Could not retrieve any register: " + err));}
    else{
      resolve(result);
    }
  });
})
}

function update(conn, nameCollection, query, newValues){
  return new Promise(function(resolve, reject) {
  const col = conn.db(dbName).collection(nameCollection);
  col.updateOne(query, newValues, function(err, result) {
    if(err){reject(console.log("Could not update any register: " + err);)}
    else{
      resolve();
    }
  });
})
}

exports.listarProductos = function (conn) {
  return new Promise(function(resolve, reject) {
  find(conn, "productos", {},
  productos => {
      resolve(productos);
  });
})
}

exports.listarCarrito = function (conn, user) {
  return new Promise(function(resolve, reject) {
  find(conn, "carrito", {user: { $eq: user }},
  productos => {
      if(productos.length != 0){
        resolve(productos);
      }
  });
})
}

exports.añadirProductoAlCarrito = function (conn, idProducto, user) {
  return new Promise(function(resolve, reject) {
  find(conn, "productos", { id: { $eq: idProducto } },
  producto => {
      if(producto.length == 0){
        console.error("No se ha encontrado el producto!");
        reject(-1);
      }
      else{
        if(producto[0].qty == 0){
          console.error("No quedan productos en stock!");
          reject(-1);
        }
        else{
          date = new Date();
          insert(conn, "carrito", {"user":user,"id":idProducto,"date":date},
          result =>
            {
              newQTY = producto[0].qty - 1;
              update(conn, "productos", { id: { $eq: idProducto } }, {$set: {qty: newQTY}},
              result => {
                resolve();
              })
            });
        }
      }
  });
})
}

exports.quitarProductoAlCarrito = function (conn, idProducto, user) {
  return new Promise(function(resolve, reject) {
  find(conn, "carrito", { id: { $eq: idProducto },  user: { $eq: user }},
  productos => {
      if(productos.length == 0){
        console.log("No se ha encontrado el producto en el carrito!");
        reject(-1);
      }
      else{
        remove(conn, "carrito", { id: { $eq: idProducto },  user: { $eq: user }},
          result => {
            find(conn, "productos", { id: { $eq: idProducto }},
            producto => {
              newQTY = producto[0].qty + 1;
              update(conn, "productos", { id: { $eq: idProducto }}, { $set: {qty: newQTY} }, result => {resolve();})
            });
          });
      }
  });
})
}
