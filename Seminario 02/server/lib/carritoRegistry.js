const semver = require('semver');

class CarritoRegistry {
    constructor(log) {
        this.log = log;
        this.products = {};
        //this.timeout = 30;
    }

    get(name, descr) {
        console.log(name, descr);
        const candidates = Object.values(this.products)
            .filter(product => product.name === name && product.descr === descr);
        console.log(candidates)
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    register(name, descr, stock) {
        const key = name + descr + stock;

        if (!this.products[key]) {
            this.products[key] = {};
            this.products[key].timestamp = Math.floor(new Date() / 1000);
            this.products[key].name = name;
            this.products[key].descr = descr;
            this.products[key].stock = stock;
            this.log.debug(`Added product ${name}, descr ${descr} with stock: ${stock}`);
            return key;
        }
        this.products[key].timestamp = Math.floor(new Date() / 1000);
        this.log.debug(`Updated product ${name}, descr ${descr} with stock: ${stock}`);
        return key;
    }

    unregister(name, descr, stock) {
        const key = name + descr + stock;
        delete this.products[key];
        return key;
    }
}

module.exports = CarritoRegistry;
