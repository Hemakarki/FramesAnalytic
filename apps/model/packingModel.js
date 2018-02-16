var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var packingSchema = new Schema({
  packingType : {type : String, required : true}
});

var packingMethod = mongoose.model('packingMethods', packingSchema);

module.exports = packingMethod;
