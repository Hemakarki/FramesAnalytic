var mongoose = require( 'mongoose' );
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var Schema = mongoose.Schema;

    var userSchema = new mongoose.Schema({
      email: {
        type: String,
        unique: true,
        required: true
      },
      firstName: {
        type: String,
        required: true
      },
      lastName: {
        type: String,
        required: true
      },
      hash: String,
      salt: String,
      userType: {
        type: String,
        required: true,
        enum: ['admin', 'user'],
        default: 'user'
      },
      shippingAddress: {
        firstName: {
          type: String
        },
        lastName: {
          type: String
        },
        address1: {
          type: String
        },
        address2: {
          type: String
        },
        zipCode: {
          type: Number
        },
        city: {
          type: String
        },
        state: {
          type: String
        }
      },
      billingAddress: {
        firstName: {
          type: String
        },
        lastName: {
          type: String
        },
        address1: {
          type: String
        },
        address2: {
          type: String
        },
        zipCode: {
          type: Number
        },
        city: {
          type: String
        },
        state: {
          type: String
        }
      },
      isDeleted: {
        type: Boolean,
        default: false
      }
    });


userSchema.methods.setPassword = function(password){
  console.log("do i reach here");
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
};

userSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha1').toString('hex');
  return this.hash === hash;
};

userSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000),
  }, "MY_SECRET"); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

var userObj =  mongoose.model('users', userSchema);
module.exports =userObj;
