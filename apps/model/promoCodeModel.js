var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var promoCodeSchema = new Schema({
  promoCode   :   {type  : String, required : true},
  description :   {type  : String, required : true},
  offerCount  :   {type  : Number},
  offerType   :   {type  : String},
  startDate   :   {type  : Date},
  endDate     :   {type  : Date},
  discount    :   {type  : Number},
  createdOn   :   {type  : Date, default : new Date()},
  isDeleted   :   {type : Boolean, default : false},
});
var promoCode = mongoose.model('promoCodes', promoCodeSchema);
module.exports = promoCode;
