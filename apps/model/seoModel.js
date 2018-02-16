var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var seoSchema = new Schema({
    keyword:{type:"String"},
    description:{type:"String"},
    type:{type:"String"}
});
var seo = mongoose.model('seo', seoSchema);
module.exports = seo;