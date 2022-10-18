const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//CandidatoVotavelSchema
const CandidatoVotavelSchema = new Schema({
  nr_votavel: {
    type: String
  },
  qt_votos: {
    type: Number
  }
});

//CandidatoVotavelSchema
const CargoSchema = new Schema({
  cd_cargo: {
    type: String
  },
  qt_votos: {
    type: Number
  },
  candidatos: [CandidatoVotavelSchema],
});

//UrnaSchema
const UrnaSchema = new Schema({
  sg_uf: {
    type: String
  },
  cd_municipio: {
    type: String
  },
  nr_zona: {
    type: String
  },
  nr_secao: {
    type: String
  },
  qt_votos: {
    type: Number
  },
  presidente: CargoSchema,
  governador: CargoSchema,
  senador: CargoSchema,
  deputadofederal: CargoSchema,
  deputadoestadual: CargoSchema
});
//UrnaSchema.index({ sg_uf: -1 });

//MunicipioSchema
const MunicipioSchema = new Schema({
  sg_uf: {
    type: String
  },
  cd_municipio: {
    type: String
  },
  nm_municipio: {
    type: String
  }
});
//MunicipioSchema.index({ sg_uf: -1 });

//CandidatoSchema
const CandidatoSchema = new Schema({
  sq_candidato: {
    type: String
  },
  nr_votavel: {
    type: String
  },
  nm_votavel: {
    type: String
  },
  cd_cargo: {
    type: String
  },
  sg_uf: {
    type: String
  },
  cd_municipio: {
    type: String
  }
});
//CandidatoSchema.index({ nr_votavel: -1 });

module.exports = {
  Urna: mongoose.model('Urna', UrnaSchema),
  Municipio: mongoose.model('Municipio', MunicipioSchema),
  Candidato: mongoose.model('Candidato', CandidatoSchema)
};
