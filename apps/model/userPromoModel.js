var mongoose = require('mongoose');
var Schema = mongoose.Schema();
var userPromoSchema = new Schema({
  promoCodeId   :   {type : Schema.Types.ObjectId, ref : 'promoCodes'},
  userId        :   {type : Schema.Types.ObjectId, ref : 'users'},
  isSucceed     :   {type : Boolean, default : false}
});
var userPromo = mongoose.model('userPromos', userPromoSchema);
module.exports = userPromo;
