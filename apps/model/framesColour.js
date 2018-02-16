var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var colourSchema = new Schema({
    frameColor: { type: String },
    isDeleted: { type: Boolean, default: false }
});
var colour = mongoose.model('framesColour', colourSchema);
module.exports = colour;
