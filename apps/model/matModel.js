var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var matScehma = new Schema({
  matColor      :   {type : String, required : true},
  matPrice      :   {type : Number, required : true, default : 0}
});

var mat = mongoose.model('mats', matScehma);
module.exports = mat;
