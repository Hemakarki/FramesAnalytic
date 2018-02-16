var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var pagesSchema = new Schema({
  title          :   {type : String, required : true},
  content        :   {type : String, required : true},
  isDeleted      :   {type : Boolean, default : false},
  createdOn      :   {type : Date, default : Date},
  templateCode   :   {type : String},
  seoTitle       :   {type : String},
  seoDescription :   {type : String},
  updatedOn      :   {type : Date}
});

var page = mongoose.model('pages', pagesSchema);
module.exports = page;
