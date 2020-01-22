
class Carro {
    constructor (products){
        if(products == null){
            this.products = [];
        } else{
            this.products = products;
        }
    }
    getProducts(){
        return Object.values(this.products)
    }
    addProduct(productName){
        this.products.push(productName)
        return this.products
    }
    removeProduct(productName){
        var index = this.products.indexOf(productName)
        if(index > -1){
            this.products.splice(index, 1);
        }
        return this.products
    }
}

exports.Carro = Carro

