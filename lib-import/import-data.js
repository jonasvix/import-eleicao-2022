'use strict';

const events = require('events');
const fs = require('fs');
const readline = require('readline');

const columnIndex = require('./column-index');
const cargoIndex = require('./cargo-index');

const models = require('../lib-mongo/models');

let apuracaoUrnas = [];
let apuracaoMunicipios = [];
let apuracaoCandidatos = [];

let urnas = [];
let municipios = [];
let candidatos = [];

const importFileTse = async function (siglaUF) {
    try {
        console.time('time-importFileTse');

        if (siglaUF == 'BR') {
            apuracaoUrnas = [];
            apuracaoMunicipios = [];
            apuracaoCandidatos = [];
        }

        urnas = [];
        municipios = [];
        candidatos = [];

        let cont = 0;
        let columns = [];

        /*let votos22 = 0;
        let votos22BR = 0;
        let votos22VT = 0;
        let votos22ZZ = 0;

        let votos13 = 0;
        let votos13BR = 0;
        let votos13VT = 0;
        let votos13ZZ = 0;

        let votosUrna = 0;

        let maiorVoto22 = 0;
        let nomeMaiorVoto22 = '';
        let maiorVoto13 = 0;
        let nomeMaiorVoto13 = '';*/

        const rl = readline.createInterface({
            input: fs.createReadStream(`./data-tse/votacao_secao_2022_${siglaUF}.csv`, { encoding: "latin1" }),
            terminal: false,
            historySize: 0,
            crlfDelay: Infinity
        }).on('line', (line) => {
            cont++;

            if (!line) return;

            const lineItens = line.substring(1, line.length - 1);
            let itens = lineItens.split('";"');
            if (!itens || itens == 0) return;

            if (columns.length == 0) {
                for (let idx = 0; idx < itens.length; idx++) {
                    let col = itens[idx].toLowerCase().replace(/\s/g, '');
                    columns.push(col);
                }

                return;
            }

            let qt_votos = Number(itens[columnIndex.qt_votos]);

            //urna
            let keyUrna = `${itens[columnIndex.sg_uf]}-${itens[columnIndex.cd_municipio]}-${itens[columnIndex.nr_zona]}-${itens[columnIndex.nr_secao]}`;

            let urna = apuracaoUrnas[keyUrna] || {
                sg_uf: itens[columnIndex.sg_uf],
                cd_municipio: itens[columnIndex.cd_municipio],
                nr_zona: itens[columnIndex.nr_zona],
                nr_secao: itens[columnIndex.nr_secao],
                qt_votos: 0
            };
            urna.qt_votos += qt_votos;

            //cargo
            let keyCargo = itens[columnIndex.ds_cargo].toLowerCase().replace(/\s/g, '');
            let cargo = urna[keyCargo] || {
                cd_cargo: itens[columnIndex.cd_cargo],
                qt_votos: 0
            };
            cargo.qt_votos += qt_votos;

            //candidatos
            let keyCandidato = `vot-${itens[columnIndex.nr_votavel]}`;
            let candidatosVotaveis = cargo.candidatosVotaveis || [];
            let candidato = candidatosVotaveis[keyCandidato] || {
                nr_votavel: itens[columnIndex.nr_votavel],
                qt_votos: 0
            };
            candidato.qt_votos += qt_votos;

            candidatosVotaveis[keyCandidato] = candidato;
            cargo.candidatosVotaveis = candidatosVotaveis;
            urna[keyCargo] = cargo;
            apuracaoUrnas[keyUrna] = urna;

            //lista de municipios
            let keyMunicipio = `${itens[columnIndex.sg_uf]}-${itens[columnIndex.cd_municipio]}`;
            apuracaoMunicipios[keyMunicipio] = {
                sg_uf: itens[columnIndex.sg_uf],
                cd_municipio: itens[columnIndex.cd_municipio],
                nm_municipio: itens[columnIndex.nm_municipio]
            };

            //lista de candidatos
            let keySqCandidato = `seq-${itens[columnIndex.sq_candidato]}`;
            apuracaoCandidatos[keySqCandidato] = {
                sq_candidato: itens[columnIndex.sq_candidato],
                nr_votavel: itens[columnIndex.nr_votavel],
                nm_votavel: itens[columnIndex.nm_votavel],
                cd_cargo: itens[columnIndex.cd_cargo],
                sg_uf: itens[columnIndex.cd_cargo] == cargoIndex.presidente ? null : itens[columnIndex.sg_uf],
                cd_municipio: itens[columnIndex.cd_cargo] == cargoIndex.presidente ? null : itens[columnIndex.cd_municipio]
            };


            /* //temp
            if (itens[columnIndex.sg_uf] == 'AP' && itens[columnIndex.cd_municipio] == '6050') {
                if (itens[columnIndex.nr_zona] == '2' && itens[columnIndex.nr_secao] == '824') {
                    votosUrna += qt_votos;
                }
            }

            if (itens[columnIndex.nr_votavel] == '22') {
                votos22 += qt_votos;

                if (itens[columnIndex.sg_uf] == 'ZZ')
                    votos22ZZ += qt_votos;
                else if (itens[columnIndex.sg_uf] == 'VT')
                    votos22VT += qt_votos;
                else //if (itens[columnIndex.sg_uf] == 'BR')
                    votos22BR += qt_votos;

                if (qt_votos > maiorVoto22) {
                    maiorVoto22 = qt_votos;
                    nomeMaiorVoto22 = itens[columnIndex.cd_municipio] + '-' + itens[columnIndex.nm_municipio];
                }
            } else if (itens[columnIndex.nr_votavel] == '13') {
                votos13 += qt_votos;

                if (itens[columnIndex.sg_uf] == 'ZZ')
                    votos13ZZ += qt_votos;
                else if (itens[columnIndex.sg_uf] == 'VT')
                    votos13VT += qt_votos;
                else //if (itens[columnIndex.sg_uf] == 'BR')
                    votos13BR += qt_votos;

                if (qt_votos > maiorVoto13) {
                    maiorVoto13 = qt_votos;
                    nomeMaiorVoto13 = itens[columnIndex.cd_municipio] + '-' + itens[columnIndex.nm_municipio];
                }
            }

            if (cont % 100000 == 0) {
                //console.log(`Line from file, keyUrna: ${keyUrna}`, urna.qt_votos);
            }*/

        });

        await events.once(rl, 'close');

        convertArray(false, siglaUF == 'BR' ? null : siglaUF);

        console.log('------------------------------------------------------------------------');
        console.log('Reading file line by line done. Count: ', cont, siglaUF);

        console.log('Urnas. Count     :', urnas.length, siglaUF);
        //console.log(JSON.stringify(urnas[0]));

        console.log('Municipios. Count:', municipios.length, siglaUF);
        //console.log(JSON.stringify(municipios[0]));

        console.log('Candidatos. Count:', candidatos.length, siglaUF);
        //console.log(JSON.stringify(candidatos[0]));

        /*console.log('------------------Geral:');
        console.log('Bolsonaro 22  : ', votos22);
        console.log('Lula 13       : ', votos13);
        console.log('Difer 22 vs 13: ', votos13 - votos22);

        console.log('------------------Nacional:');
        console.log('Bolsonaro 22-BR     : ', votos22BR);
        console.log('Lula 13-BR          : ', votos13BR);
        console.log('Difer 22-BR vs 13-BR: ', votos13BR - votos22BR);

        console.log('------------------Trânsito:');
        console.log('Bolsonaro 22-VT     : ', votos22VT);
        console.log('Lula 13-VT          : ', votos13VT);
        console.log('Difer 22-VT vs 13-VT: ', votos13VT - votos22VT);

        console.log('------------------Exterior:');
        console.log('Bolsonaro 22-ZZ     : ', votos22ZZ);
        console.log('Lula 13-ZZ          : ', votos13ZZ);
        console.log('Difer 22-ZZ vs 13-ZZ: ', votos13ZZ - votos22ZZ);

        console.log('------------------Teste:');
        console.log('Votos em uma urna      : ', votosUrna);

        console.log('------------------Maior:');
        console.log('Bolsonaro 22 maior     : ', maiorVoto22, nomeMaiorVoto22);
        console.log('Lula 13 maior          : ', maiorVoto13, nomeMaiorVoto13);*/

        console.log('------------------');
        console.timeEnd('time-importFileTse');

        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
        console.log('------------------------------------------------------------------------');

        if (siglaUF != 'BR') {
            await saveToMongo(siglaUF);
        }
    } catch (err) {
        console.error('importFileTse', siglaUF, err);
    }
};

const convertArray = function (deleteOld, siglaUF) {
    //urnas
    urnas = [];
    for (let keyUrna in apuracaoUrnas) {
        let urna = apuracaoUrnas[keyUrna];

        if (!siglaUF || siglaUF == urna.sg_uf) {
            cargoIndex.Cargos.forEach(cargo => {
                if (urna[cargo]) {
                    urna[cargo].candidatos = [];
                    for (let keyCandidato in urna[cargo].candidatosVotaveis) {
                        urna[cargo].candidatos.push(urna[cargo].candidatosVotaveis[keyCandidato]);
                    }

                    if (deleteOld)
                        delete urna[cargo].candidatosVotaveis;
                }
            });

            urnas.push(urna);

            if (deleteOld)
                delete apuracaoUrnas[keyUrna];
        }
    }

    //municipios
    municipios = [];
    for (let keyMunicipio in apuracaoMunicipios) {
        let municipio = apuracaoMunicipios[keyMunicipio];

        if (!siglaUF || siglaUF == municipio.sg_uf) {
            municipios.push(municipio);

            if (deleteOld)
                delete apuracaoMunicipios[keyMunicipio];
        }
    }

    //candidatos
    candidatos = [];
    for (let keySqCandidato in apuracaoCandidatos) {
        let candidato = apuracaoCandidatos[keySqCandidato];

        if (!siglaUF || siglaUF == candidato.sg_uf) {
            candidatos.push(candidato);

            if (deleteOld)
                delete apuracaoCandidatos[keySqCandidato];
        }
    }
}

const saveToMongo = async function (siglaUF) {
    try {
        console.time('time-saveToMongo');

        convertArray(true, siglaUF);

        let limit = 10000;

        const options = {
            ordered: false,
            lean: true,
            limit: limit
        };

        //municipios
        const resultMunicipios = await models.Municipio.insertMany(municipios, options);
        console.log(`${resultMunicipios.length} resultMunicipios documents were inserted.`, siglaUF);
        municipios = [];

        //candidatos
        const resultCandidatos = await models.Candidato.insertMany(candidatos, options);
        console.log(`${resultCandidatos.length} resultCandidatos documents were inserted.`, siglaUF);
        candidatos = [];

        //urnas
        while (urnas.length) {
            let limitBulk = urnas.length < limit ? urnas.length : limit;
            let bulkItens = urnas.slice(0, limitBulk);
            urnas = urnas.slice(limitBulk);

            const resultUrnas = await models.Urna.insertMany(bulkItens, options);
            console.log(`${resultUrnas.length} resultUrnas documents were inserted.`, siglaUF);
        }
        urnas = [];

        console.log('------------------');
        console.timeEnd('time-saveToMongo');

        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
        console.log('------------------------------------------------------------------------');
    } catch (err) {
        console.error('saveToMongo', err);
    }
}

module.exports = {
    importFileTse: importFileTse,
    saveToMongo: saveToMongo
};
