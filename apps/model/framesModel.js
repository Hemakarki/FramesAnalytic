var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// var frameImages = new Schema ({
//   isPrimary : { type : Boolean },
//   imgPath   : { type : String }
// });

var frameImages = new Schema ({
  imageType : { type : String, default: 'SECONDRY'},
  isPrimary : { type : Boolean , default : true},
  imgPath   : { type : String }
});

var frameSchema = new Schema({
    frameName       : { type: String , required : true, unique : true},
    frameDescription: { type: String ,required : true},
    frameOverview   : { type: String ,required : true},
    frameColor      : { type: String ,required : true},
    frameSize       : { type : String ,required : true},
    frameImages     : [ frameImages ],
    isDeleted       : { type: Boolean, default: false }
});
var frames = mongoose.model('frames', frameSchema);
module.exports = frames;
