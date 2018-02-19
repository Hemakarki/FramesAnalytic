var passport = require('passport');
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var User = require('./../model/users');
var api = require('instagram-node').instagram();
var emailTemplateModel = require('./../model/emailTemplateModel');
var request = require('superagent');
var mailchimpInstance   = 'us16',
    listUniqueId        = 'e52f71bac9',
    mailchimpApiKey     = '482544e45d30ee4c10b140866d5c3823-us16';


var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'smartdata.ms@gmail.com',
    pass: 'chd$$sdei022'
  }
});

api.use({
  client_id: '2f4a3c2d0d4d4166be80911dc42d2a62',
  client_secret: '8ba536b3d11a4395a9b737bcbd089022'
});

var redirect_uri = 'http://localhost:3000/api/instagramAuth';

exports.authorize_user = function(req, res) {

  // Allow Cross Domain Request from anywhere...
  /*res.status(200);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", true);*/

  res.redirect(api.get_authorization_url(redirect_uri, {}));
};

exports.instagramAuth = function(req, res) {
  api.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
      res.send("Didn't work");
    } else {

      api.use({
        access_token: result.access_token
      });
      api.user_self_media_recent(function(err, medias, pagination, remaining, limit) {
        if (err) {
          console.log(err);
        }
        res.jsonp(medias);
      });

      //res.send('You made it!!');
    }
  });
};



module.exports.register = function(req, res) {
  if (!req.body.email || !req.body.password) {
    sendJSONresponse(res, 400, {
      "message": "All fields are required"
    });
    return;
  }
  if (!req.body.confirmPassword || !req.body.password) {
    sendJSONresponse(res, 400, {
      "message": "Confirm password and Password are not same."
    });
    return;
  }

  User.findOne({
    "email": req.body.email
  }, function(err, resp) {
    if (!err) {
      if (resp) {
        var outputJSON = {};
        outputJSON.status = 422;
        outputJSON.message = "User with same Email id Already registerd";
        outputJSON.userData = resp;
        res.status(422).send(outputJSON);
      } else {
        var user = new User();
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        var pass = 
        user.setPassword(req.body.password);
        if (req.body.Billing) {
          user.billingAddress.firstName = req.body.Billing.firstName;
          user.billingAddress.lastName = req.body.Billing.lastName;
          user.billingAddress.address1 = req.body.Billing.address1;
          user.billingAddress.address2 = req.body.Billing.address2;
          user.billingAddress.city = req.body.Billing.city;
          user.billingAddress.zipCode = req.body.Billing.zipCode;
          user.billingAddress.state = req.body.Billing.state;
        } else {
          user.billingAddress = {};
        }
        if (req.body.Shipping) {
          user.shippingAddress.firstName = req.body.Shipping.firstName;
          user.shippingAddress.lastName = req.body.Shipping.lastName;
          user.shippingAddress.address1 = req.body.Shipping.address1;
          user.shippingAddress.address2 = req.body.Shipping.address2;
          user.shippingAddress.city = req.body.Shipping.city;
          user.shippingAddress.zipCode = req.body.Shipping.zipCode;
          user.shippingAddress.state = req.body.Shipping.state;
        } else {
          user.shippingAddress = {};
        }
        user.save(function(err, userData) {
          if (err) {
            res.status(400);
          } else {
            emailTemplateModel.findOne({
              "templateCode": "welcome-user"
            }).exec(function(err, response) {
              if (response) {
               var token;
               token = user.generateJwt();
               res.status(200);
               content_user = response.content;
               content_user = content_user.replace("{{USERNAME}}", user.email);
               var mailOptions = {
                 from: 'surjitk@smartdatainc.net',
                 to: user.email,
                 subject: response.title,
                 html: content_user
               };
     
               transporter.sendMail(mailOptions, function(error, info) {
                 if (error) {
                   var outputJSON = {};
                   outputJSON.status = 400;
                   outputJSON.message = "Something went wrong, can't send mail";
                   outputJSON.error = error;
                   res.status(400).send(outputJSON);
                 } else {
                 }
               });

               request
               .post('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + listUniqueId + '/members/')
               .set('Content-Type', 'application/json;charset=utf-8')
               .set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey ).toString('base64'))
               .send({
                 'email_address': userData.email,
                 'status': 'subscribed',
                 'merge_fields': {
                   'FNAME': userData.firstName,
                   'LNAME': userData.lastName
                 }
               })
               .end(function(error, response) {
                 if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
                  //  res.send('Signed Up!');
                 } else {
                   var outputJSON = {};
                   outputJSON.status = 400;
                   outputJSON.message = "Error in Registered with mailChimp";
                   outputJSON.error = error;
                   res.status(400).send(outputJSON);
                 }
               });
              }
              else {
              	console.log("No Response");
                // var outputJSON = {};
                // outputJSON.status = 304;
                // outputJSON.message = "No Response";
                // res.status(304).send(outputJSON);
              }
            });
            var sections = {};
            sections.payment = true;
            sections.confirm = false;
            sections.accountDetails = false;
            sections.checkoutLogin = false;

            if(req.body.Billing || req.body.Shipping) {
              req.session.user = userData;
            }

            var outputJSON = {};
            outputJSON.status = 200;
            outputJSON.message = "Successfully registered user.";
            outputJSON.sections = sections;
            outputJSON.userData = userData;
            //  session to make user logged in after register
            res.status(200).send(outputJSON);
          }

        });

      }
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Something went wrong";
      outputJSON.error = err;
      res.status(500).send(outputJSON);
    }
  })
};



module.exports.guestRegister = function(req, res) {
  if (!req.body.email) {
    sendJSONresponse(res, 400, {
      "message": "All fields are required"
    });
    return;
  }

  var user = new User();

  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.email = req.body.email;

  if (req.body.Billing) {
    user.billingAddress.firstName = req.body.Billing.firstName;
    user.billingAddress.lastName = req.body.Billing.lastName;
    user.billingAddress.address1 = req.body.Billing.address1;
    user.billingAddress.address2 = req.body.Billing.address2;
    user.billingAddress.city = req.body.Billing.city;
    user.billingAddress.zipCode = req.body.Billing.zipCode;
    user.billingAddress.state = req.body.Billing.state;
  } else {
    user.billingAddress = {};
  }
  if (req.body.Shipping) {
    user.shippingAddress.firstName = req.body.Shipping.firstName;
    user.shippingAddress.lastName = req.body.Shipping.lastName;
    user.shippingAddress.address1 = req.body.Shipping.address1;
    user.shippingAddress.address2 = req.body.Shipping.address2;
    user.shippingAddress.city = req.body.Shipping.city;
    user.shippingAddress.zipCode = req.body.Shipping.zipCode;
    user.shippingAddress.state = req.body.Shipping.state;
  } else {
    user.shippingAddress = {};
  }
  
  User.findOne({
    "email": req.body.email
  }, function(error, success) {
    if (!error) {
      if (success) {
        User.update({"_id": success._id}, {$set: {
            "firstName": user.firstName,
            "lastName" : user.lastName,
            "billingAddress": user.billingAddress,
            "shippingAddress": user.shippingAddress
          }
        }).exec(function(errUp, resUp) {
          if (!errUp) {
            User.findOne({"_id": success._id}, function(errorr, userData) {
              if (!errorr) {
                req.session.guestUser = userData;
                var sections = {};
                sections.checkoutLogin = false;
                sections.accountDetails = false;
                sections.payment = true;
                sections.confirm = false;
                var data = {};
                data.userData = userData;
                data.sections = sections;
                res.status(200).send(data);
              }
            })
          } else {
            res.status(500).send(errUp);
          }
        });
      } else {
        user.save(function(err, userData) {
          if (err) {
            res.status(400);
          } else {
            req.session.guestUser = userData;
            var sections = {};
            sections.checkoutLogin = false;
            sections.accountDetails = false;
            sections.payment = true;
            sections.confirm = false;
            var data = {};
            data.userData = userData;
            data.sections = sections;
            res.status(200).send(data);
          }

          var mailOptions = {
            from: 'surjitk@smartdatainc.net',
            to: user.email,
            subject: 'Made By Ollie: Welcome!',
            html: "<h4> Hello "+ user.email + "</h4>"+
            "<p> Welcome to Made By Ollie. Thanks for joining. </p><p>Regards,<br />Made By Ollie</p>"
          };

          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        });
      }
    } else {
      res.status(500).send(error);
    }
  })
}



module.exports.login = function(req, res) {
  var user = res.req.user;
  if (user) {
    token = user.generateJwt();
    req.session.user = res.req.user;
    if (req.session.checkout != undefined) {
      var sections = {};
      sections.checkoutLogin = false;
      sections.accountDetails = true;
      sections.payment = false;
      sections.confirm = false;
      req.session.checkout = sections;
    } else {
      var sections = {};
      sections.checkoutLogin = false;
      sections.accountDetails = true;
      sections.payment = false;
      sections.confirm = false;
      req.session.checkout = sections;
    }
    res.status(200);
    res.json({
      "token": token,
      "sections": sections,
      "userData": user
    });
  } else {
    // If user is not found
    res.status(401).json("No user found");
  }
};

exports.loginAdmin = function(req, res) {
  var user = res.req.user;
  if (user) {
    token = user.generateJwt();
    req.session.admin = res.req.user;
    if (req.session.checkout != undefined) {
      var sections = {};
      sections.checkoutLogin = false;
      sections.accountDetails = true;
      sections.payment = false;
      sections.confirm = false;
      req.session.checkout = sections;
    } else {
      var sections = {};
      sections.checkoutLogin = false;
      sections.accountDetails = true;
      sections.payment = false;
      sections.confirm = false;
      req.session.checkout = sections;
    }
    res.status(200);
    res.json({
      "token": token,
      "sections": sections,
      "userData": user
    });
  } else {
    // If user is not found
    res.status(401).json("No user found");
  }
}



module.exports.forgotPassword = function(req, res) {

  var user = new User();

  email = req.body.email;
  var done = {};
  User.findOne({
    email: email
  }, function(err, user) {
    if (err) {
      var outputData = {};
      outputData.status = 500;
      outputData.message = "Error in forgot password.";
      outputData.error = err;
      res.status(500).send(outputData);
    }
    // Return if user not found in database
    if (!user) {
       var outputData = {};
       outputData.status = 304;
       outputData.message = "email not found.";
       outputData.error = err;
       res.status(304).send(outputData);
    }

    // If credentials are correct, reset password
    password = randomString(10);
    user.setPassword(password);

    var token;
    token = user.generateJwt();
    // res.status(200);
    // res.json({
    //   "token": token
    // });

    User.findOneAndUpdate({"email": user.email}, {$set: {"hash": user.hash,"salt": user.salt}}, {new: true}, function(err, user) {      
      if (err) {
        res.status(404).json(err);
        return;
      } else{
          emailTemplateModel.findOne({"templateCode": "reset-email"}).exec(function(err, response) {
            if (!err) {
              content_user = response.content;
              content_user = content_user.replace("{{USERNAME}}", user.email);
              content_user = content_user.replace("{{PASSWORD}}",password);
              
              var templateVal = content_user;
              var mailOptions = {
                from: 'surjitk@smartdatainc.net',
                to: user.email,
                subject: response.title,
                html: "<div data-ng-bind-html=''>"+ content_user + "</div>"
              };
              transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                  var outputJSON = {};
                  outputJSON.status = 400;
                  outputJSON.message = "Error in forgot password Api";
                  outputJSON.error = error;
                  res.status(200).send(outputJSON);
                } else {
                  var outputJSON = {};
                  outputJSON.status = 200;
                  outputJSON.message = "New Password is sent to your mail Id";
                  outputJSON.data = info.response;
                  outputJSON.token = token;
                  res.status(200).send(outputJSON);
                }
              });
            } else {
              var outputJSON = {};
              outputJSON.status = 400;
              outputJSON.message = "Error in Email Template Model";
              outputJSON.error = err;
              res.status(400).send(outputJSON)
            }
          });
      }
    });
    //res.status(200).json(user);
    return;
  });
};


var randomString = function(length = 10) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}








/*
***********************************************************
 Function  :  Update User Address for Billing
 Dated     :  01-November-2017
***********************************************************
*/


exports.updateBilling = function(req, res) {
  var searchQry = {};
  if(req.session.user != undefined) {
    searchQry._id = req.session.user._id;  
  }
  else {
    searchQry._id = req.body.userId;
  }
  var updateQry = {};
  updateQry.billingAddress = req.body;
  User.findOneAndUpdate(searchQry, {$set : updateQry}, {new : true}).exec(function(err, userResp) {
    if(!err && userResp) {
      var outputJSON = {};
      outputJSON.status = 200;
      outputJSON.message = "Billing Address updated";
      outputJSON.updatedData = userResp;
      res.status(200).send(outputJSON)
    } else {
      var outputJSON = {};
      outputJSON.status = 400;
      outputJSON.message = "No User Id";
      outputJSON.error = err;
      res.status(400).send(outputJSON);
    }
  });
}


/*
***********************************************************
 Function  :  Update User Address for Billing
 Dated     :  01-November-2017
***********************************************************
*/

exports.updateShipping = function(req, res) {
  var searchQry = {};
  if(req.session.user != undefined) {
    searchQry._id = req.session.user._id;  
  }
  else {
    searchQry._id = req.body.userId;
  }
  var updateQry = {};
  updateQry.shippingAddress = req.body;
  User.findOneAndUpdate(searchQry, {$set : updateQry}, {new : true}).exec(function(err, userResp) {
    if(!err && userResp) {
      var outputJSON = {};
      outputJSON.status = 200;
      outputJSON.message = "Shipping Address updated";
      outputJSON.updatedData = userResp;
      res.status(200).send(outputJSON)
    } else {
      var outputJSON = {};
      outputJSON.status = 400;
      outputJSON.message = "Password not matched";
      outputJSON.error = err;
      res.status(400).send(outputJSON);
    }
  });
}


/*
***********************************************************
 Function  :  Update User Address for Billing
 Dated     :  01-November-2017
***********************************************************
*/


exports.updatePersonal = function(req, res) {
  var user = new User();
  var searchQry = {};
  var updateQry = {};
  if(req.session.user != undefined) {
    searchQry._id = req.session.user._id;  
  }
  else {
    searchQry._id = req.body.userId;
  }
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  if(req.body.password && req.body.confirmPassword) {
    if(req.body.password === req.body.confirmPassword) {
      user.setPassword(req.body.password);
      updateQry.hash = user.hash;
      updateQry.salt = user.salt;
      updateQry.firstName = user.firstName;
      updateQry.lastName =  user.lastName;
      updateUser(searchQry, updateQry, req, res);
    } else {
        var outputJSON = {};
        outputJSON.status = 304;
        outputJSON.message = "Password not matched";
        outputJSON.updatedData = req.body;
        res.status(304).send(outputJSON);
    }
  } else {
    updateQry.firstName = user.firstName;
    updateQry.lastName =  user.lastName;
    updateUser(searchQry, updateQry, req, res);
  }
}


var updateUser = function(searchQry, updateQry, req, res) {
  User.findOneAndUpdate(searchQry, {$set : updateQry}, {new : true}).exec(function(err, userResp) {
    if(!err && userResp) {
      var outputJSON = {};
      outputJSON.status = 200;
      outputJSON.message = "Personal Details updated";
      outputJSON.updatedData = userResp;
      res.status(200).send(outputJSON);
    } else {
      var outputData = {};
      outputData.status = 400;
      outputData.message = "Personal Details Error";
      outputData.error = err;
      res.status(400).send(outputData);
    }
  });
}