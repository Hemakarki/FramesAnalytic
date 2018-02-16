var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var products = new Schema({
  frameId         : { type    : Schema.Types.ObjectId, ref : 'frames', default : null },
  artId           : { type    : Schema.Types.ObjectId, ref : 'arts', default : null },
  matId           : {type     : Schema.Types.ObjectId, ref: 'mats', default : null},
  productImage    : { type    : String, default : null },
  imageSize       : {
                      width   : { type : Number },
                      height  : { type : Number }
                    },
  type            : { type    : String, default : null },
  quantity        : { type    : Number, default : 1 },
  isDigital       : { type    : Boolean, deafault : false },
  itemPrice       : { type    : Number, default : 0 }
});


var orderSchema = new Schema({
  userId          : {type   : Schema.Types.ObjectId, ref:'users', default : null},
  orderNumber     : {type : Number, default : null},
  products		    : [products],
  promoId         : {type   : String , default : null},
  totalPrice      : {type   : Number, default : 0},
  isGift          : {type   : Boolean, default : false},
  isPromo         : {type   : Boolean, default : false},
  giftMessage     : {type   : String, default : null },
  createdOn       : {type   : Date, default : new Date()},
  payment_method  : {type   : String, default : null},
  transaction_id  : {type   : String, default : null},
  payment_status  : {type   : String, default : null}
});

var orders = mongoose.model('orders', orderSchema);
module.exports = orders;
