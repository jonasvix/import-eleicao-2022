'use strict';

const importData = require('./import-data');

(async () => {
    await importData.importFileTse('BR');

    await importData.importFileTse('AC');
    await importData.importFileTse('AL');
    await importData.importFileTse('AM');
    await importData.importFileTse('AP');
    await importData.importFileTse('BA');
    await importData.importFileTse('CE');
    await importData.importFileTse('DF');
    await importData.importFileTse('ES');
    await importData.importFileTse('GO');
    await importData.importFileTse('MA');
    await importData.importFileTse('MG');
    await importData.importFileTse('MS');
    await importData.importFileTse('MT');
    await importData.importFileTse('PA');
    await importData.importFileTse('PB');
    await importData.importFileTse('PE');
    await importData.importFileTse('PI');
    await importData.importFileTse('PR');
    await importData.importFileTse('RJ');
    await importData.importFileTse('RN');
    await importData.importFileTse('RO');
    await importData.importFileTse('RR');
    await importData.importFileTse('RS');
    await importData.importFileTse('SC');
    await importData.importFileTse('SE');
    await importData.importFileTse('SP');
    await importData.importFileTse('TO');

    await importData.saveToMongo();
})().catch(err => {
    console.error('lib-import', err);
});
