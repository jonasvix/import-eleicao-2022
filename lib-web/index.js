'use strict';

const http = require('http');

const models = require('../lib-mongo/models');

const hostname = '127.0.0.1';
const port = 3000;

let resultHttp = {};

models.Municipio.count({}, function (err, count) {
    if (err) {
        console.error('Municipio count', err);
        return;
    }

    resultHttp.countMunicipio = count;
});

models.Candidato.count({}, function (err, count) {
    if (err) {
        console.error('Candidato count', err);
        return;
    }

    resultHttp.countCandidato = count;
});

models.Urna.count({}, function (err, count) {
    if (err) {
        console.error('Urna count', err);
        return;
    }

    resultHttp.countUrna = count;
});

models.Urna.find({
    sg_uf: { $ne: 'ZZ' },
    $expr: { $ne: ["$presidente.qt_votos", "$governador.qt_votos"] }
}, 'sg_uf cd_municipio nr_zona nr_secao presidente.qt_votos governador.qt_votos',
    function (err, docs) {
        if (err) {
            console.error('Urna em transito', err);
            return;
        }

        console.log('Urna em transito', docs.length);

        resultHttp.countUrnaEmTransito = docs.length;

        resultHttp.urnasEmTransitos = docs;
    });

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');

    res.end(JSON.stringify(resultHttp));
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
