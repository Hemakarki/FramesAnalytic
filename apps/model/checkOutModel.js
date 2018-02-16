var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var checkOutSchema = new Schema({
   estimatedDays : {type:Number}
});
var checkout = mongoose.model('checkout', checkOutSchema);
module.exports = checkout;