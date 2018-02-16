var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var artSizeCatagory = new Schema({
  artSize           : { type : Object },
  artSizeTypeId     : {type   : String}
})

var artSizes = new Schema({
  width           :   {type   : Number},
  height          :   {type   : Number}
})

var artSchema = new Schema({
  artType         :   {type   : String, default : null},
  artSizeCatagory :   [artSizeCatagory],
  artSizes        :   [artSizes],
  mailIn          :   {type   : Boolean , default : false},
  height          :   {type   : String},
  width           :   {type   : String}
});

var art = mongoose.model('arts', artSchema);
module.exports = art;
