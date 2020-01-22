const express = require('express');
const CarritoRegistry = require('./lib/carritoRegistry');

const service = express();

module.exports = (config) => {
    const log = config.log();
    const carritoRegistry = new CarritoRegistry(log);
    // Add a request logging middleware in development mode
    if (service.get('env') === 'development') {
        service.use((req, res, next) => {
            log.debug(`${req.method}: ${req.url}`);
            return next();
        });
    }


    service.put('/register/:name/:descr/:stock', (req, res) => {
        const { name, descr, stock } = req.params;
        const serviceKey = carritoRegistry.register(name, descr, stock);
        return res.json({ result: serviceKey });
    });


    service.delete('/register/:name/:descr/:stock', (req, res) => {
        const { name, descr, stock } = req.params;
        const serviceKey = carritoRegistry.unregister(name, descr, stock);
        return res.json({ result: serviceKey });
    });

    service.get('/find/:name/:descr', (req, res) => {
        const { name, descr } = req.params;
        const svc = carritoRegistry.get(name, descr);
        if (!svc) return res.status(404).json({ result: 'Product not found' });
        return res.json(svc);
    });

    // eslint-disable-next-line no-unused-vars
    service.use((error, req, res, next) => {
        res.status(error.status || 500);
        // Log out the error to the console
        log.error(error);
        return res.json({
            error: {
                message: error.message,
            },
        });
    });
    return service;
};
