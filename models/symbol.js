var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SymbolSchema = new Schema({
    index: { type: Number, required: true },
    char: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true }
});

module.exports = mongoose.model('Symbol', SymbolSchema);