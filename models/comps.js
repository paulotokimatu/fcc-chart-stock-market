var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Comp = new Schema({
    company: {
        type: String,
        required: true,
        unique: true,
    }
});

module.exports = mongoose.model('Comp', Comp);
