var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var SizeCostSchema = new Schema({
    frameSize : { type: String },
    frameCost : { type: Number, default: 0 },
    upto      : {
                  width : { type : Number },
                  height : { type : Number }
                }
});
var size_cost = mongoose.model('sizesUponCosts', SizeCostSchema);
module.exports = size_cost;
