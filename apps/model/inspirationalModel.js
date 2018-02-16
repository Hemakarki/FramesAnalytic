var mongoose = require('mongoose');
var Schema = mongoose.Schema

var inspirationalSchema = new Schema({
	name: {
		type: String
	},
	image: {
		type: String
	},
	isDeleted: {
		type: Boolean,
		default: false
	},
});

var inspiration = mongoose.model('inspiration', inspirationalSchema);
module.exports = inspiration;