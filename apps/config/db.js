 //create connection with mongodb
var mongoose = require('mongoose');
const prod = false;
const devp = true
//connect wit mongodb
if(prod) {
	var connection_uri = 'mongodb://'+process.env.DB_USER + ':' + process.env.DB_PASS + '@' + process.env.DB_HOST + '/' + process.env.DB_NAME + '?authSource=' + process.env.DB_USER;
	mongoose.connect(connection_uri, { useMongoClient: true }, function(err) {
		if(err)
			return console.error(err);
	});
}
if(devp) {
	mongoose.connect('mongodb://'+'localhost:27017'+'/framesNow', { useMongoClient: true } , function(err) {
		if(err)
			return console.error(err);
	});
}
