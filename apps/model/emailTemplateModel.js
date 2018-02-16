var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var emailTemplateSchema = new Schema({
  title          :   {type : String, required : true},
  content        :   {type : String, required : true},
  isDeleted      :   {type : Boolean, default : false},
  createdOn      :   {type : Date, default : Date},
  templateCode   :   {type : String},
  updatedOn      :   {type : Date}
});

var template = mongoose.model('emailTemplate', emailTemplateSchema);
module.exports = template;
