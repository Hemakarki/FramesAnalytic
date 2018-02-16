module.exports = function(app , express) {

  var router = express.Router();
  var userObj = require('./../apps/controller/userController');
  var jwt = require('express-jwt');
  var auth = jwt({
    secret: 'MY_SECRET',
    userProperty: 'payload'
  });



  router.get('/getCart', userObj.getCart);
  router.get('/getSizeCosts', userObj.getSizeCosts);
  router.get('/listMat', userObj.listMat);
  router.get('/artSizes', userObj.artSizes);
  router.get('/myCart', userObj.myCart);
  router.get('/frameColours', userObj.frameColours);
  router.get('/checkSession', userObj.checkSession);
  router.get('/getUserDetails', userObj.getUserDetails);
  router.get('/myOrders', userObj.myOrders);
  router.get('/logout', userObj.logout);
  router.get('/getInspirationalImages',userObj.getInspirationalImages);
  router.get('/getMetaTags',userObj.getMetaTags);
  router.get('/updateCartPrice', userObj.updateCartPrice);
  router.get('/getCheckOutDate', userObj.getCheckOutDate);
  router.get('/getCompareProducts', userObj.getCompareProducts );
  router.get('/resetCompareCart', userObj.resetCompareCart);

  router.post('/tempCart', userObj.tempCart);
  router.post('/saveDigitalImage', userObj.saveDigitalImage);
  router.post('/framesList', userObj.framesList);
  router.post('/getFrame', userObj.getFrame);
  router.post('/updateArt', userObj.updateArt);
  router.post('/newArt', userObj.newArt);
  router.post('/newArtMobile', userObj.newArtMobile);
  router.post('/getFrameSize', userObj.getFrameSize);
  router.post('/matDetails', userObj.matDetails);
  router.post('/addToCart', userObj.addToCart);
  router.post('/addToComapre', userObj.addToComapre);
  router.post('/addToCartMob', userObj.addToCartMob);
  router.post('/addToCartProduct', userObj.addToCartCompare);
  router.post('/getCartMob', userObj.getCartMob);
  router.post('/deleteProduct', userObj.deleteProduct);
  router.post('/deleteProductMob', userObj.deleteProductMob);
  router.post('/makeDuplicateProduct', userObj.makeDuplicateProduct);
  router.post('/addInstruction', userObj.addInstruction);
  router.post('/saveAddress', userObj.saveAddress);
  router.post('/cartGiftMessage', userObj.updateCartGift);
  router.post('/updateProductQuantity', userObj.updateProductQuantity);
  router.post('/applyPromoCode', userObj.applyPromoCode);
  router.post('/promoCode', userObj.promoCode);
  router.post('/getImageSizeCost', userObj.getImageSize);
  router.post('/getUserAddress',userObj.getUserAddress);
  router.post('/getMetaData',userObj.getMetaData);
  router.post('/saveArtImage', userObj.saveArtImage);
  router.post('/myOrders', userObj.myOrders);
  router.post('/removeCompare', userObj.removeCompareIndex);
  router.post('/updateMailinType', userObj.updateMailinType);
  app.use('/users', router);
}


function checkSignIn(req, res){
  if(req.session.user){
    next();
    //If session exists, proceed to page
  }
  else {
    var err = new Error("Not logged in!");
    console.log('Not logged in!');
    next(err);
    //Error, trying to access unauthorized page!
  }
}
