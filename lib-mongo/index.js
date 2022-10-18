'use strict';

const mongoose = require('mongoose');
const config = require('./config');

module.exports.start = function (cb) {
    const auth = config.username ? `${config.username}:${config.password}@` : '';

    const uri = `mongodb://${auth}${config.db.host}:${config.db.port}/${config.db.name}`;

    mongoose.connect(uri, config.db.options, (err, db) => {
        if (err) {
            console.error("Erro ao conectar ao Mongodb: ", uri, err);
            cb(err, db);
            return;
        }

        require('./models');

        console.log('Connection Mongodb succesful.', uri);

        cb(null, db);
    });
};
