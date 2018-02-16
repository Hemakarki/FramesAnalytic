var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var products = new Schema({
  frameId: {
    type: Schema.Types.ObjectId,
    ref: "frames",
    default: null
  },
  artId: {
    type: Schema.Types.ObjectId,
    ref: "arts",
    default: null
  },
  matId: {
    type: Schema.Types.ObjectId,
    ref: "mats",
    default: null
  },
  productImage: {
    type: String,
    default: null
  },
  imageSize: {
    width: {
      type: Number
    },
    height: {
      type: Number
    }
  },
  inCart : {type : Boolean, default : false}, 
  itemPrice: {type: Number, default: 0},
  optionalExtra : { type : Number}, 
  quantity: {
    type: Number,
    default: 1
  },
  imageSizeCost: {
    frameSize: {
      type: String
    },
    frameCost: {
      type: Number
    }
  },
  isDigital: {
    type: Boolean,
    default: false
  },
  createdOn: {
    type: Date,
    default: new Date()
  },
  frameAspectRatio: {
    type: Number,
    default: 0
  },
  frameDimensions: {
    height: {
      type: Number,
      default: 0
    },
    width: {
      type: Number,
      default: 0
    }
  },
  type: {
    type: String,
    default: null
  },
  artType: {
    type: String,
    default: null
  },
  mailinType: {
    type: String,
    default: null
  }
});

var cartSchema = new Schema({
  tempUserId: {
    type: String,
    default: null
  },
  promoId: {
    type: String,
    default: null
  },
  products: [products],
  totalPrice: {
    type: Number,
    default: 0
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    default: null
  },
  isTemp: {
    type: Boolean,
    default: true
  },
  isGift: {
    type: Boolean,
    default: false
  },
  isPromo: {
    type: Boolean,
    default: false
  },
  giftMessage: {
    type: String,
    default: null
  }
});

var cartModel = mongoose.model("carts", cartSchema);
module.exports = cartModel;
