const mongoose = require('mongoose');

let ingredienteSchema = new mongoose.Schema({
    nombre:{
        type: String,
        minlength: 2,
        required: true
    },
    cantidad:{
        type: Number,
        min: 1,
        required: true
    },
    unidad:{
        type: String,
        enum: ['gr', 'cucharadas', 'unidades']
    }
});

let recetaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        minlength: 5
    },
    imagen:{
        type: String
    },
    comensales:{
        type: Number,
        min: 1,
        required: true
    },
    preparacion:{
        type: Number,
        required: true,
        min: 1
    },
    coccion:{
        type: Number,
        required: true,
        min: 0
    },
    descripcion:{
        type: String,
        required: true
    },
    ingredientes:{
        type: [ingredienteSchema]
    }
});

let Receta = mongoose.model('receta', recetaSchema);
module.exports = Receta;