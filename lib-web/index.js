'use strict';

const http = require('http');

const consultas = require('./consultas');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;

    res.setHeader('Content-Type', 'application/json');

    res.end(JSON.stringify(consultas.getResultConsultas()));
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
