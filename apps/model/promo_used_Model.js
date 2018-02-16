var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var promoUserSchema = new Schema({
  promoId     :   {type  : Schema.Types.ObjectId, ref:'promos'},
  userId      :   {type  : Schema.Types.ObjectId, ref:'users'},
  isSuccess   :   {type  : Boolean, default : false},
  attempedOn  :   {type  : Date, default : new Date()}
});
var promo_used = mongoose.model('promo_used', promoUserSchema);
module.exports = promo_used;