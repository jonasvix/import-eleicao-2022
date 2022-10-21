'use strict';

const fs = require('fs');

const models = require('../lib-mongo/models');

let resultConsultas = {};

//Municipio qtd
models.Municipio.count({}, function (err, count) {
    if (err) return console.error('Municipio count', err);

    resultConsultas.qt_municipios = count;
});

//Candidato qtd
models.Candidato.count({}, function (err, count) {
    if (err) return console.error('Candidato count', err);

    resultConsultas.qt_candidatos = count;
});

//Urna qtd
models.Urna.count({}, function (err, count) {
    if (err) return console.error('Urna count', err);

    resultConsultas.qt_urnas = count;
});

//Urna soma
models.Urna.aggregate([{
    $group: {
        _id: null,
        qt_votos_presidente: {
            $sum: "$presidente.qt_votos"
        },
        qt_votos_governador: {
            $sum: "$governador.qt_votos"
        }
    }
}], function (err, result) {
    if (err) return console.error('Urna soma', err);

    resultConsultas.qt_votos_presidente = result[0].qt_votos_presidente;
    resultConsultas.qt_votos_governador = result[0].qt_votos_governador;
});

//Urna diferente
models.Urna.aggregate([
    {
        $match: {
            $expr: {
                $and: [
                    { $ne: ["$sg_uf", "ZZ"] },
                    {
                        $ne: ["$presidente.qt_votos",
                            "$governador.qt_votos"]
                    }
                ]
            }
        }
    },
    {
        $lookup: {
            from: "municipios",
            localField: "cd_municipio",
            foreignField: "cd_municipio",
            as: "municipio"
        }
    },
    {
        $project: {
            sg_uf: 1, cd_municipio: 1, nr_zona: 1, nr_secao: 1,
            municipio: { nm_municipio: 1 },

            qt_votos_presidente: "$presidente.qt_votos",
            candidato_22: {
                $filter: {
                    input: "$presidente.candidatos",
                    as: "item",
                    cond: { $eq: ["$$item.nr_votavel", "22"] },
                    limit: 1
                }
            },
            candidato_13: {
                $filter: {
                    input: "$presidente.candidatos",
                    as: "item",
                    cond: { $eq: ["$$item.nr_votavel", "13"] },
                    limit: 1
                }
            },

            qt_votos_governador: "$governador.qt_votos"
        }
    }
]).exec(function (err, docs) {
    if (err) return console.error('Urna diferente', err);

    console.log('Urna diferente1', docs.length);

    let urnas_diferente_pre_gov = [];

    let qt_votos_diferente_presidente = 0;
    let qt_votos_diferente_governador = 0;

    docs.forEach(doc => {
        qt_votos_diferente_presidente += doc.qt_votos_presidente;
        qt_votos_diferente_governador += doc.qt_votos_governador;

        let url_tse = `https://resultados.tse.jus.br/oficial/app/index.html#/eleicao;e=e544;uf=${doc.sg_uf};ufbu=${doc.sg_uf};mubu=${doc.cd_municipio};zn=${doc.nr_zona};se=${doc.nr_secao}/dados-de-urna/boletim-de-urna`;

        let qt_votos_pre_22 = doc.candidato_22[0] ? doc.candidato_22[0].qt_votos : 0;
        let qt_votos_pre_13 = doc.candidato_13[0] ? doc.candidato_13[0].qt_votos : 0;

        let urna_diferente = {
            sg_uf: doc.sg_uf,
            cd_municipio: doc.cd_municipio,
            nm_municipio: doc.municipio && doc.municipio.length ? doc.municipio[0].nm_municipio : null,
            nr_zona: doc.nr_zona,
            nr_secao: doc.nr_secao,

            qt_votos_presidente: doc.qt_votos_presidente,
            qt_votos_pre_22: qt_votos_pre_22,
            qt_votos_pre_13: qt_votos_pre_13,
            qt_votos_pre_outros: doc.qt_votos_presidente - (qt_votos_pre_22 + qt_votos_pre_13),

            qt_votos_governador: doc.qt_votos_governador,

            url_tse: url_tse
        };

        urnas_diferente_pre_gov.push(urna_diferente);
    });

    resultConsultas.qt_votos_diferente_presidente = qt_votos_diferente_presidente;
    resultConsultas.qt_votos_diferente_governador = qt_votos_diferente_governador;

    resultConsultas.qt_urnas_diferente_presidente_governador = urnas_diferente_pre_gov.length;

    resultConsultas.urnas_diferente_pre_gov = urnas_diferente_pre_gov;

    let csvTexto = convertToCSV(urnas_diferente_pre_gov);

    fs.writeFile(`./tmp/urnas_diferentes_${urnas_diferente_pre_gov.length}.csv`, csvTexto, function (err) {
        if (err) return console.error('Urna diferente writeFile', err);

        console.log('Urna diferente writeFile', 'The file was saved!');
    });

    console.log('Urna diferente2', urnas_diferente_pre_gov.length);
});

////Urna por estado
let sg_uf = 'ES';
models.Urna.aggregate([
    { $match: { "sg_uf": sg_uf } },
    {
        $lookup: {
            from: "municipios",
            localField: "cd_municipio",
            foreignField: "cd_municipio",
            as: "municipio"
        }
    },
    {
        $project: {
            sg_uf: 1, cd_municipio: 1, nr_zona: 1, nr_secao: 1,
            municipio: { nm_municipio: 1 },

            qt_votos_presidente: "$presidente.qt_votos",
            candidato_22: {
                $filter: {
                    input: "$presidente.candidatos",
                    as: "item",
                    cond: { $eq: ["$$item.nr_votavel", "22"] },
                    limit: 1
                }
            },
            candidato_13: {
                $filter: {
                    input: "$presidente.candidatos",
                    as: "item",
                    cond: { $eq: ["$$item.nr_votavel", "13"] },
                    limit: 1
                }
            },

            qt_votos_governador: "$governador.qt_votos"
        }
    }
]).exec(function (err, docs) {
    if (err) return console.error('Urna estado', sg_uf, err);

    console.log('Urna estado 1', sg_uf, docs.length);

    let urnas = [];

    docs.forEach(doc => {
        let url_tse = `https://resultados.tse.jus.br/oficial/app/index.html#/eleicao;e=e544;uf=${doc.sg_uf};ufbu=${doc.sg_uf};mubu=${doc.cd_municipio};zn=${doc.nr_zona};se=${doc.nr_secao}/dados-de-urna/boletim-de-urna`;

        let qt_votos_pre_22 = doc.candidato_22[0] ? doc.candidato_22[0].qt_votos : 0;
        let qt_votos_pre_13 = doc.candidato_13[0] ? doc.candidato_13[0].qt_votos : 0;

        let sg_vencedor = qt_votos_pre_22 > qt_votos_pre_13 ? 'Venceu22' :
            (qt_votos_pre_22 < qt_votos_pre_13 ? 'Venceu13' : 'Empate');

        let urna = {
            sg_uf: doc.sg_uf,
            cd_municipio: doc.cd_municipio,
            nm_municipio: doc.municipio && doc.municipio.length ? doc.municipio[0].nm_municipio : null,
            nr_zona: doc.nr_zona,
            nr_secao: doc.nr_secao,

            qt_votos_presidente: doc.qt_votos_presidente,
            qt_votos_pre_22: qt_votos_pre_22,
            qt_votos_pre_13: qt_votos_pre_13,
            qt_votos_pre_outros: doc.qt_votos_presidente - (qt_votos_pre_22 + qt_votos_pre_13),

            sg_vencedor: sg_vencedor,

            qt_votos_governador: doc.qt_votos_governador,

            sg_votos_diferente_gov_pres: doc.qt_votos_presidente == doc.qt_votos_governador ? 'Igual' : 'Diferente',

            url_tse: url_tse
        };

        urnas.push(urna);
    });

    let csvTexto = convertToCSV(urnas);

    fs.writeFile(`./tmp/urnas_${sg_uf}_${urnas.length}.csv`, csvTexto, function (err) {
        if (err) return console.error('Urna estado writeFile', sg_uf, err);

        console.log('Urna estado writeFile', sg_uf, 'The file was saved!');
    });

    console.log('Urna estado 2', sg_uf, urnas.length);
});

const convertToCSV = function (arr) {
    const array = [Object.keys(arr[0])].concat(arr);

    return array.map(it => {
        return `"${Object.values(it).join('";"')}"`;
    }).join('\n');
}

const getResultConsultas = function () {
    return { ...resultConsultas };
}

module.exports = {
    getResultConsultas: getResultConsultas
};
