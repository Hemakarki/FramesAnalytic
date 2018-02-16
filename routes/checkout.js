module.exports = function(app , express) {
    var router = express.Router();
    var userObj = require('./../apps/controller/userController');

    router.get('/myCart', userObj.myCart);
    router.get('/updateCartUserId', userObj.updateCartUserId);
    router.get('/userAddress', userObj.getUserAddress);
    router.get('/pay', userObj.pay);
    router.get('/success', userObj.success);
    router.get('/cancel', userObj.cancel);
    router.get('/getCheckOutDate', userObj.getCheckOutDate);
    router.get('/updateCartPrice', userObj.updateCartPrice);

    router.post('/makePayment', userObj.payment);
    router.post('/makeMobilePayment', userObj.paymentMobile);
    router.post('/checkOut', userObj.checkOut);
    router.post('/updateUser', userObj.updateAddress);
    router.post('/checkOutMobile', userObj.checkOutMobile);
    router.post('/getStripeToken', userObj.getStripeTokenMobile);

    router.get('/pay', userObj.pay);
    router.get('/success', userObj.success);
    router.get('/cancel', userObj.cancel);

    app.use('/checkout', router);
}
