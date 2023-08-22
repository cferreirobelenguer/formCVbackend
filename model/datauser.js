'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define el esquema
const DataSchema = new Schema({
    name: String,
    tel: String,
    email: String,
    pdf: Buffer,
});

// Crea el modelo utilizando el esquema
const DataModel = mongoose.model('User', DataSchema);

module.exports = DataModel;