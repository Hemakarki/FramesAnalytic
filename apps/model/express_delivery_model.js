var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var expressDeliverySchema = new Schema({
   deliveryCharges : {type:Number}
});
var Delivery = mongoose.model('expressdelivery', expressDeliverySchema);
module.exports = Delivery;