'use strict';

const libMongo = require('./lib-mongo');

libMongo.start(function (err) {
    if (err) return;

    if (process.env.NODE_ENV == 'web') {
        require('./lib-web');
    } else if (process.env.NODE_ENV == 'import1') {
        require('./lib-import');
    } else {
        console.info(`Exec: npm start; ou npm run import1. "${process.env.NODE_ENV}"`);
    }
});

process.on('exit', function (code) {
    console.log('About to exit with code:', code);
});

process.on('warning', (warning) => {
    console.warn('warning', warning.name, warning.message, warning.stack);
});

console.log("Program Started.", process.env.NODE_ENV);
