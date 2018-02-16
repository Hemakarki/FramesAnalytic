module.exports = function(app, express) {
    var passport = require('passport');
    var BasicStrategy = require('passport-http').BasicStrategy;
    var BearerStrategy = require('passport-http-bearer').Strategy;

    var router = express.Router();
    var multer = require('multer');
    var upload = multer({
        dest: 'uploads/'
    });

    var adminObj = require('./../apps/controller/adminController');



    router.get('/frameColours', adminObj.frameColours);
    router.get('/artSizeCosts', adminObj.artSizeCosts);
    router.get('/pages', adminObj.getPage);

    router.get('/emailTemplates', adminObj.getTemplate);
    router.get('/getSizeCost', adminObj.getSizeCost);
    router.get('/exportOrders', adminObj.exportOrders);
    router.get('/exportUsers', adminObj.exportUsers);
    router.get('/exportProducts', adminObj.exportProducts);
    router.get('/listSEO',adminObj.listSEO);

    router.post('/submitTemplate', adminObj.submitTemplate);
    router.post('/updateTemplate', adminObj.updateTemplate);
    router.post('/getAllPages', adminObj.getAllPages);
    router.post('/getPageData', adminObj.getPageData);
    router.post('/deletePageData', adminObj.deletePageData);
    router.post('/saveOrderStatus', adminObj.saveOrderStatus);

    router.post('/listFrames', adminObj.listFrames);
    router.post('/addFrames', adminObj.addFrames);
    router.post('/editFrame', adminObj.editFrame);
    router.post('/saveFrame', adminObj.saveFrame);
    router.post('/deleteFrame', adminObj.deleteFrame);
    router.post('/frameDeatils', adminObj.frameDeatils);
    router.post('/addColour', adminObj.addColour);
    router.post('/deleteColor', adminObj.deleteColor);


    router.post('/ordersInfo', adminObj.getOrderDetail);

    router.post('/submitInspirationData',adminObj.submitInspirationData);
    router.post('/listInspirational',adminObj.listInspirational);
    router.post('/deleteInspirationalData',adminObj.deleteInspirationalData);
    router.post('/getInspirationalData',adminObj.getInspirationalData);
    router.post('/updateInspirationData',adminObj.updateInspirationData);
    router.post('/removeFrameImg', adminObj.removeFrameImg);

    router.post('/addPromoCode',adminObj.addPromoCode);
    router.post('/getPromoList',adminObj.getPromoList);
    router.post('/deletePromoCode',adminObj.deletePromoCode);
    router.post('/getPromoCodeDetails',adminObj.getPromoCodeDetails);
    router.post('/updatePromoCode',adminObj.updatePromoCode);

    router.post('/addSEO',adminObj.addSEO);
    router.post('/updateSEO',adminObj.updateSEO);
    router.post('/getSEOValue',adminObj.getSEOValue);

    router.post('/addTemplate',adminObj.addTemplate);
    router.post('/editTemplate',adminObj.editTemplate);
    router.post('/listTemplate',adminObj.listTemplate);
    router.post('/getTemplate',adminObj.getTemplate);
    router.post('/updateTemplate',adminObj.updateTemplate);
    router.post('/updateSize', adminObj.updateSizeCost);
    router.post('/getallUsers', adminObj.getallUsers);
    router.post('/getallOrders', adminObj.getallOrders);
    router.post('/getPaymentReport', adminObj.getPaymentReport);
    router.post('/createPage', adminObj.createPage);
    router.get('/getOrderDetail/:id', adminObj.getOrderDetail);
    router.get('/getUserOrderDetail/:id', adminObj.getUserOrderDetail);
    router.get('/getUserDetail/:id', adminObj.getUserDetail)
    router.put('/undeleteuser/:id', adminObj.undeleteuser);
    router.put('/deleteuser/:id', adminObj.deleteuser);
    router.post('/getDetails',adminObj.getDetails);
    router.post('/updateUserDetails',adminObj.updateUserDetails);
    router.post('/addETA',adminObj.addETA);
    router.get('/getCheckoutDetails',adminObj.getCheckoutDetails);
    router.post('/updateETA',adminObj.updateETA);

    router.post('/addDelivery',adminObj.addDelivery);
    router.get('/getDeliveryDetails',adminObj.getDeliveryDetails);
    router.post('/updateDelivery',adminObj.updateDelivery);


    app.use('/admin', router);

}
