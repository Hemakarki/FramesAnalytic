module.exports = function(app, express) {
	var router = express.Router();
	var adminObj = require('./../apps/controller/adminController');
	router.post('/getstartFramingContent', adminObj.getstartFramingContent);

	app.use('/pages', router);
}
