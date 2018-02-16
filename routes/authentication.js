module.exports = function(app, express,passport) {

    var authObj = require('./../apps/controller/authentication.js');
    var router = express.Router();


    router.post('/login', passport.authenticate('localuser', {
		session: true
	}), authObj.login);

    router.post('/loginAdmin', passport.authenticate('localadmin', {
		session: true
	}), authObj.loginAdmin);

    router.post("/register", authObj.register);
    router.post("/guestUser", authObj.guestRegister);
    router.post("/forgotPassword", authObj.forgotPassword);
    router.post('/updateBilling', authObj.updateBilling);
    router.post('/updateShipping', authObj.updateShipping);
    router.post('/updatePersonal', authObj.updatePersonal);
    app.use('/authentication', router);

}
