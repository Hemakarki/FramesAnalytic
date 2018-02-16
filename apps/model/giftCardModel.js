var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var giftCardSchema = new Schema({
  giftCardCode :   {type  : String},
  offer        :   {type  : String},
  notes        :   {type  : String}
});
var giftCard = mongoose.model('giftCards', giftCardSchema);
module.exports = giftCard;
