var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shippingAddress = new Schema({
  firstName         : {type : String},
  lastName          : {type : String},
  address           : {type : String, required : true},
  zipCode           : {type : Number, required : true},
  city              : {type : String, required : true},
  state             : {type : String, required : true},
  phone             : {type : String, required : true}
});


var billingAddress = new Schema({
  firstName         : {type : String, required : true},
  lastName          : {type : String, required : true},
  address           : {type : String, required : true},
  zipCode           : {type : Number, required : true},
  city              : {type : String, required : true},
  state             : {type : String, required : true},
  phone             : {type : String, required : true}
});

var packagingAddress = new Schema({
  firstName         : {type : String, required : true},
  lastName          : {type : String, required : true},
  address           : {type : String, required : true},
  zipCode           : {type : Number, required : true},
  city              : {type : String, required : true},
  state             : {type : String, required : true},
  phone             : {type : String, required : true}
})

var userSchema = new Schema({
  email             : {type : String},
  password          : {type : String},
  user_type: {
    type: Number,
	default: 2,
    enum: [1, 2]   //[Admin(1), User(2)]
  },
  shippingAddress   : [shippingAddress],
  billingAddress    : [billingAddress],
  packagingAddress  : [packagingAddress],
  favorites         : [{type  : Schema.Types.ObjectId, ref:'frames'}],
  isDeleted         : {type : Boolean, default : false}
});

var users = mongoose.model('usersss', userSchema);
module.exports = users;
