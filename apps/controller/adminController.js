var mongoose = require('mongoose');
var formidable = require('formidable');
var XLSX = require("xlsx");
var http = require('http');
var fs = require('fs');
const download = require('image-downloader')

var paths = require('path');
var url = require('url')

var appDir = paths.dirname(require.main.filename);

var json2xls = require('json2xls');
var frameModel = require('./../model/framesModel');
var userLoginObj = require('./../model/userModel');
var colourModel = require('./../model/framesColour');
var sizeCostModel = require('./../model/frameSizeCostModel');
var userObj = require('./../model/users');
var orderObj = require('./../model/orderModel');
var inspirationObj = require('./../model/inspirationalModel');
var sizeCostModel = require('./../model/frameSizeCostModel');
var userTokenObj = require('./../model/userTokens.js');
var promoObj = require('./../model/promoCodeModel.js');
var seoObj = require('./../model/seoModel.js');
var checkOutObj = require('./../model/checkOutModel.js');
var expressdelivery = require('./../model/express_delivery_model');
var pagesModel = require('./../model/pagesModel');
var emailTemplateModel = require('./../model/emailTemplateModel');
var path = require('path');
var fs = require('fs');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var CryptoJS = require("crypto-js");
var moment = require("moment");
// var tokenService = require('  ./../services/tokenAuth.js');

passport.use('bearer', new BearerStrategy(function(token, done) {
    userTokenObj.findOne({
            token: token
        })
        .populate('user')
        .exec(function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            return done(null, user.user, {
                scope: 'all'
            });
        });
    // });
}));


//admin login
var LocalStrategy = require('passport-local').Strategy;
passport.use('userObj', new LocalStrategy(
    function(username, password, done) {
        userLoginObj.findOne({
            username: username
        }, function(err, adminuser) {
            if (err) {
                return done(err);
            }

            if (!adminuser) {
                return done(null, false);
            }
            var decryptedData = CryptoJS.AES.decrypt(adminuser.password.toString(), constantObj.messages.encryptionKey);

            var newdecryptedData = decryptedData.toString(CryptoJS.enc.Utf8);
            //if(newdecryptedData != password) {
            if (newdecryptedData != JSON.stringify(password)) {
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }

            //generate a token here and return
            var authToken = tokenService.issueToken({
                sid: adminuser
            });
            // save token to db  ;

            var tokenObj = new userTokenObj({
                "user": adminuser._id,
                "token": authToken
            });

            tokenObj.save(function(e, s) {
                // console.log(e,s) ;
            });

            return done(null, {
                user: adminuser,
                token: authToken
            });
        });
    }
));

//.serializeUser(userLoginObj.serializeUser);
//passport.deserializeUser(userLoginObj.deserializeUser);

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


exports.authenticate = function(req, res, done) {

    var data = req.user;
    var user_type = data.user.user_type;
    var outputdataJSON = "";
    if (user_type == 2) { //User
        outputdataJSON = {
            'messagID': 200
        };

        outputdataJSON = {
            'status': 'approved',
            'userType': 2,
            'messageId': 200,
            'message': constantObj.messages.clinicianApprovedLogin,
            "data": data,
            "access_token": req.user.token
        };
    } else if (user_type == 1) { //Web Admin
        outputdataJSON = {
            'messageId': 200,
            "data": data,
            "access_token": req.user.token,
            "userType": 1
        };

        outputdataJSON.status = "success";
        outputdataJSON.message = constantObj.messages.WebAdminSuccessfulLogin;

    } else {
        outputdataJSON = {
            'status': 'error',
            'messageId': 200,
            'message': constantObj.messages.UnauthorizedAccessError
        };
    }
    res.jsonp(outputdataJSON);
    // res.jsonp({'status':status, 'messageId':messagID, 'message':message,"data":data ,"access_token": req.user.token});
}


/*
	Function: logout
	Created:
*/

exports.logout = function(req, res) {
    $localStorage.$reset();
    $rootScope.loggedInUser = false;
    $rootScope.loggedInUserType = false;
    $rootScope.userLoggedIn = false;
    $location.path('/access/login');
}

/*
	Function: forgot password
	Created: Jatinder Singh
*/

exports.forgotPassword = function(req, res) {
    var outputJSON = "";
    userObj.findOne({
        email: req.body.email
    }, function(err, data) {
        if (err) {
            // console.log(err);
            return res.send(err);
        } else {
            if (!data) {
                outputJSON = {
                    'status': 'failure',
                    'messageId': 203,
                    'message': constantObj.messages.emailDoesnotExist
                }
                return res.send(outputJSON);
            }
            var token = createJWT(data);
            var port = "" //process.env.PORT|| 3000 ;
            var resetUrl = "http://" + req.headers.host + "/#/reset-password";

            forgotPasswordObj.findOne({
                email: req.body.email
            }, function(err, dataExist) {
                if (err) {
                    return res.send(err);
                } else {
                    if (dataExist) {
                        var updating = {};
                        updating = {
                            "token": token,
                            "expirationPeriod": moment(new Date()).add(1, 'days').format(),
                            "token_used": false
                        };


                        forgotPasswordObj.update({
                            "username": dataExist.username
                        }, {
                            $set: updating
                        }, function(err, post) {
                            if (err) {
                                var response = {
                                    "code": 401,
                                    "messageId": 401,
                                    "messageText": "Token is already generated!"
                                };
                                return res.status(401).send(response);
                            }

                            if (post) {
                                var response = {
                                    "code": 200,
                                    "messageId": 200,
                                    "messageText": "email link sent to " + data.email + " !"
                                }
                                sendResetLinkEmail(data, resetUrl, token, req);
                                return res.status(200).send(response)
                            }
                        });
                    } else {
                        var adding = new forgotPasswordObj({
                            "userId": data._id,
                            "username": data.username,
                            "email": data.email,
                            "token": token,
                            "expirationPeriod": moment(new Date()).add(1, 'days').format(),
                            "token_used": false
                        });

                        adding.save(function(err, post) {
                            if (err) {
                                var response = {
                                    "code": 401,
                                    "messageId": 401,
                                    "messageText": "Token is already generated!"
                                };
                                return res.status(401).send(response);
                            }

                            if (post) {
                                var response = {
                                    "code": 200,
                                    "messageId": 200,
                                    "messageText": "email link sent to " + data.email + " !"
                                }
                                sendResetLinkEmail(data, resetUrl, token, req);
                                return res.status(200).send(response)
                            }
                        });
                    }
                }
            });
            //});
        }
    });
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment(new Date()).add(1, 'days').format()
    };
    return jwt.encode(payload, constantObj.facebookCredentials.token_secret);
}


// reset password from forgot password link email
exports.resetPassword = function(req, res) {

    forgotPasswordObj.findOne({
        token: req.body.token
    }, function(err, data) {
        if (err || !data) {
            var response = {
                "code": 400,
                "messageText": "Can't process your request!"
            }
            return res.status(400).send(response);
        } else {
            if (data.token_used) {
                var response = {
                    "code": 400,
                    "messageText": "Token is already used."
                }
                return res.status(400).send(response);
            }
            // return false;
            if (moment(data.expirationPeriod).format() < moment().format()) { //if token expire
                var response = {
                    "code": 400,
                    "messageText": "Token is expired!"
                }
                forgotPasswordObj.remove({
                    "token": req.body.token
                }, function(err, data) {
                    if (err) {
                        var response = {
                            "code": 420,
                            "messageText": "Error Occurred"
                        };
                        return res.status(420).send(response);

                    } else {
                        var response = {
                            "code": 400,
                            "messageText": "Token is Expired! Try Again"
                        };
                        return res.status(400).send(response);

                    }


                })
            } else { // If token is not expired
                var userName = data.username;
                userObj.update({
                    username: data.username
                }, {
                    $set: {
                        "password": req.body.password
                    }
                }, function(err, data) {
                    if (err) {
                        outputJSON = {
                            'sForgottatus': 'failure',
                            'messageId': 203,
                            'message': constantObj.messages.userStatusUpdateFailure
                        }
                        return res.status(203).send(err);
                    }
                    if (data) {
                        outputJSON = {
                                'status': 'success',
                                'messageId': 200,
                                'message': constantObj.messages.userStatusUpdateSuccess
                            }
                            //return res.status(200).send(outputJSON);
                            /*forgotPasswordObj.remove({
                            	"token": req.body.token
                            }, function(err, data) {
                            	if (err) {
                            		var response = {
                            			"code": 400,
                            			"messageText": "error deleting the token"
                            		};
                            		return res.status(400).send(response);
                            	} else {
                            		var response = {
                            			"code": 200,
                            			"messageText": "Token Successfully Deleted"
                            		};
                            		return res.status(200).send(outputJSON);
                            	}
                            })*/

                        // update token used status to true.
                        forgotPasswordObj.update({
                            username: userName
                        }, {
                            $set: {
                                "token_used": true
                            }
                        }, function(err, data) {
                            if (err) {
                                var response = {
                                    "code": 400,
                                    "messageText": "Error updating the token."
                                };
                                return res.status(400).send(response);
                            } else {
                                var response = {
                                    "code": 200,
                                    "messageText": "Token Successfully Updated"
                                };
                                return res.status(200).send(response);
                            }
                        })
                    }
                })
            }
        }
    })
}



exports.forgotUsername = function(req, res) {
    var outputJSON = "";
    userObj.findOne({
        email: req.body.email
    }, function(err, data) {
        if (err) {
            outputJSON = {
                'status': 'failure',
                'messageId': 203,
                'message': constantObj.messages.errorRetreivingData
            };
        } else {
            if (data) {
                var transporter = nodemailer.createTransport({
                    service: constantObj.gmailSMTPCredentials.service,
                    auth: {
                        user: constantObj.gmailSMTPCredentials.username,
                        pass: constantObj.gmailSMTPCredentials.password
                    }
                });

                transporter.sendMail({
                    from: 'rajatg@smartdatainc.net',
                    to: data.email,
                    subject: 'Your Username',
                    text: data.username
                });

                outputJSON = {
                    'status': 'success',
                    'messageId': 200,
                    'message': constantObj.messages.successSendingForgotPasswordEmail
                }
            } else {
                outputJSON = {
                    'status': 'failure',
                    'messageId': 203,
                    'message': constantObj.messages.errorRetreivingData
                };
            }
        }
        res.jsonp(outputJSON);
    });
}

// Developer : RaJesh
exports.changePassword = function(req, res) {
    var outputJSON = "";
    var updatePassword = {};
    updatePassword.password = req.body.newpassword;
    var newpassword = req.body.newpassword;
    userObj.findOne({
        _id: req.body._id
    }, function(err, data) {
        if (err) {
            outputJSON = {
                'status': 'failure',
                'messageId': 203,
                'message': constantObj.messages.errorRetreivingData
            };
        } else {
            if (data.password) {
                var decryptedData = CryptoJS.AES.decrypt(data.password.toString(), constantObj.messages.encryptionKey);
                var decryptedOldPassword = decryptedData.toString(CryptoJS.enc.Utf8);
            }

            var decryptedData1 = CryptoJS.AES.decrypt(newpassword.toString(), constantObj.messages.encryptionKey);
            var decryptedNewPassword = decryptedData1.toString(CryptoJS.enc.Utf8);

            if (decryptedOldPassword == JSON.stringify(req.body.password)) {
                if (decryptedOldPassword == decryptedNewPassword) {
                    // Old password and new password can't be same
                    outputJSON = {
                        'status': 'warning',
                        'messageId': 201,
                        'message': constantObj.messages.oldNewPasswordSameError
                    };
                    res.jsonp(outputJSON);
                } else {
                    userObj.update({
                        "_id": req.body._id
                    }, {
                        $set: updatePassword
                    }, function(err, result) {
                        outputJSON = {
                            'status': 'success',
                            'messageId': 200,
                            'message': constantObj.messages.passwordChangedSuccess
                        };
                        res.jsonp(outputJSON);
                    });
                }
            } else {
                outputJSON = {
                    'status': 'failure',
                    'messageId': 203,
                    'message': constantObj.messages.oldPasswordIncorrect
                };
                res.jsonp(outputJSON);
            }
        }
    });
}

function sendResetLinkEmail(data, resetUrl, token, req) {
    var userDetails = {};
    userDetails.email = data.email;
    userDetails.full_name = data.first_name + " " + data.last_name;
    userDetails.app_link = resetUrl + "/" + token;
    var frm = 'BH app<noreply@bh-app.com>';
    var emailSubject = 'BH App - Password Reset Link';
    var emailTemplate = 'passwordreset.html';
    emailService.send(userDetails, emailSubject, emailTemplate, frm, req);
}







/*
***********************************************************
 Function  :  Add Frames with frame picture by admin
 Dated     :  09-August-2017
***********************************************************
*/


exports.addFrames = function(req, res) {
    var fetchData = {};
    fetchData.dimensions = {};
    var imageData = {};
    fetchData.frameName = req.body.frameName;
    fetchData.frameDescription = req.body.frameDescription;
    fetchData.frameSize = req.body.frameSize;
    fetchData.frameOverview = req.body.frameOverview;
    fetchData.frameColor = req.body.frameColor;
    fetchData.frameName = req.body.frameName;
    var frameArray = req.body.frameImage;

    if (req.body.frameImage.length != 0) {
        saveImagesInfo(0, frameArray, [], function(resErr, imageArray) {
            if (!resErr) {
                fetchData.frameImages = imageArray;
                frameModel(fetchData).save(function(err, insertdata) {
                    if (!err) {
                        if (insertdata) {
                            var outputJSON = {};
                            outputJSON.status = 200;
                            outputJSON.message = "Frame Successfully Added";
                            outputJSON.frameData = insertdata;
                            res.status(200).send(outputJSON);
                        } else {
                            var outputJSON = {};
                            outputJSON.status = 204;
                            outputJSON.message = "Something Went Wrong";
                            res.status(204).send(outputJSON);
                        }
                    } else {
                        var outputJSON = {};
                        outputJSON.status = 500;
                        outputJSON.message = "Error while adding frmaes";
                        outputJSON.error = err;
                        res.status(500).send(outputJSON);
                    }
                });
            } else {
                var outputJSON = {};
                outputJSON.status = 500;
                outputJSON.message = "Error while saving frmaes";
                outputJSON.error = resErr;
                res.status(500).send(outputJSON);
            }
        })
    } else {
        var outputJSON = {};
        outputJSON.status = 500;
        outputJSON.message = "Please Select at least one image for Upload";
        outputJSON.error = resErr;
        res.status(500).send(outputJSON);
    }
}



var saveImagesInfo = function(i, frameArray, imageArray, callb) {
    if (i < frameArray.length) {
        if (frameArray[i].imgData != undefined && frameArray[i].imgData.base64 != "") {
            var imageData = {};
            imageData.base64 = frameArray[i].imgData.base64;
            imageData.filetype = frameArray[i].imgData.filetype;
            imageData.filename = frameArray[i].imgData.filename;
            imageData.isPrimary = frameArray[i].isPrimary;
            imageData.imageType = frameArray[i].imageType;
            getImgPath(imageData, function(errorr, imagesPath) {
                if (!errorr) {
                    var imgObj = {};
                    imgObj.isPrimary = imageData.isPrimary;
                    imgObj.imageType = imageData.imageType;
                    imgObj.imgPath = imagesPath;
                    imageArray.push(imgObj);
                    saveImagesInfo(++i, frameArray, imageArray, callb);
                } else {
                    callb(errorr, 'Unsuccess');
                }
            });
        } else {
            callb(null, imageArray);
        }
    } else {
        callb(null, imageArray);
    }
}



var getImgPath = function(imageData, cb) {
    getImage(imageData, function(err, imagePath) {
        if (!err) {
            cb(null, imagePath);
        } else {
            cb(err, null);
        }
    });
}



/*
***********************************************************
 Function  :  Function for image upload in base 64
 Dated     :  09-August-2017
***********************************************************
*/



var getImage = function(imagesdata, cd) {
  var date = Date.now();
  var currentDate = date.valueOf();
  var imageName = imagesdata.filename;
  var name = imageName + "-" + currentDate;
  var imageType = imagesdata.filetype;
  var filetype = imageType.split("/");
  var type = filetype[1];
  var imageData = imagesdata.base64;
  imageData = "data:" + imagesdata.filetype + ";base64," + imageData;
  decodeBase64Image(imageData, function(imgerr, imgres) {
    if (!imgerr) {
      var pathToStore = path.join(__dirname + "./../../public/images/frames/" + imagesdata.imageType + "/");
      var imageName = name + "." + type;
      var imagePath = imageName;
      //var imagePath = req.protocol + "://" + req.headers.host + "/uploads/" + imageName;
      fs.writeFile(pathToStore + imageName, imgres.data, function(err, img) {
        if (!err) {
          cd(null, imagePath);
        } else {
          cd(err, null);
        }
      });
    } else {
      cd(imgerr, null);
    }
  });
};

//Function to decode Image
function decodeBase64Image(dataString, callbackData) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};
    if (matches) {
        if (matches.length !== 3) {
            //return new Error('Invalid input string');
            callbackData('invalid string', null);
        } else {
            response.type = matches[1];
            response.data = new Buffer(matches[2], 'base64');
            callbackData(null, response);
        }
    } else {
        callbackData('invalid image', null);
        //response.error = "invalid image ";
    }
}


/*
***********************************************************
 Function  :  List of Frames by Admin
 Dated     :  09-August-2017
***********************************************************
*/



exports.listFrames = function(req, res) {

    try {
        var page = req.body.pageno || 1;
        var count = req.body.itemsPerPage || 1;

        var searchQry = "";
        if (req.body.searchColor) {
            searchQry = req.body.searchColor;
        }

        // var sortkey = null;
        // for (key in req.body.sort) {
        //   sortkey = key;
        // }
        // if (sortkey) {
        //   var sortquery = {};
        //   sortquery[sortkey ? sortkey : ''] = req.body.sort ? (req.body.sort[sortkey] == 'asc' ? 1 : -1) : 1;
        // }

        var filter = {};
        filter.$and = [{
            "isDeleted": false
        }]
        if (searchQry) {
            filter.$or = [{
                frameColor: {
                    $regex: searchQry,
                    '$options': 'i'
                }
            }];
        }

        var skipNo = (page - 1) * count;

        frameModel.aggregate([{
            $match: filter
        }, {
            $skip: skipNo
        }, {
            $limit: count
        }]).exec(function(err, frameData) {
            if (!err) {
                if (frameData) {
                    var outputJSON = {};

                    frameModel.find(filter).count().exec(function(err, total) {
                        outputJSON.status = 200;
                        outputJSON.message = "FrameData Success";
                        outputJSON.frameData = frameData;
                        outputJSON.count = total;
                        res.status(200).send(outputJSON);
                    });

                } else {
                    var outputJSON = {};
                    outputJSON.status = 204;
                    outputJSON.message = "Frame Data not Found";
                    res.status(204).send(outputJSON);
                }
            } else {
                var outputJSON = {};
                outputJSON.status = 500;
                outputJSON.message = "Something Went Wrong";
                outputJSON.error = err;
                res.status(500).send(outputJSON);
            }
        });
    } catch (e) {
        res.send({
            "error": e
        });
    }
}




/*
***********************************************************
 Function  :  List of Frames by Admin
 Dated     :  09-August-2017
***********************************************************
*/



exports.exportProducts = function(req, res) {
    var searchQry = {};
    searchQry.isDeleted = false;
    frameModel.find(searchQry, function(error, frames) {
        if(!error && frames) {
            var filePath = req.protocol +  "://" + req.headers.host;
            var framesList = [];
            for(var i = 0; i < frames.length ; i++) {
                var obj = {};
                obj.Name = frames[i].frameName;
                obj.Summary = frames[i].frameDescription
                obj.Description = frames[i].frameOverview;
                obj.Color = frames[i].frameColor;
                obj.Size = frames[i].frameSize;
                if(frames[i].frameImages[0].isPrimary == true) {
                    obj.LandscapeFrame = filePath + "/images/frames/landscape/" + frames[i].frameImages[0].imgPath;
                    obj.PortraitFrame = filePath + "/images/frames/portrait/" + frames[i].frameImages[0].imgPath;
                    obj.SquarFrame = filePath + "/images/frames/square/" + frames[i].frameImages[0].imgPath;
                }
                framesList.push(obj);
            }
            res.xls('frames.xlsx', framesList);
                    
        }
        else {
            var outputJSON = {};
            outputJSON.status = 400;
            outputJSON.message = "Something Went Wrong";
            outputJSON.error = error;
            res.status(400).send(outputJSON);
        }
    });
}




/*
***********************************************************
 Function  :  Get edited frame information by admin
 Dated     :  09-August-2017
***********************************************************
*/



exports.editFrame = function(req, res) {
    var fetchData = {};
    fetchData._id = req.body._id;
    frameModel.findOne(fetchData).exec(function(err, frameData) {
        if (!err) {
            if (frameData) {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "Frame Success";
                outputJSON.frameData = frameData;
                res.status(200).send(outputJSON);
            } else {
                var outputJSON = {};
                outputJSON.status = 204;
                outputJSON.message = "Something Went Wrong";
                res.status(204).send(outputJSON);
            }
        } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Error while fetching frmaes";
            outputJSON.error = err;
            res.status(500).send(outputJSON);
        }
    })
}



/*
***********************************************************
 Function  :  Save edited frame INformation by Admin
 Dated     :  09-August-2017
***********************************************************
*/



exports.saveFrame = function(req, res) {

    var fetchData = {};
    var imageData = {};
    var searchQry = {};
    fetchData.frameName = req.body.frameName;
    fetchData.frameDescription = req.body.frameDescription;
    fetchData.frameOverview = req.body.frameOverview;
    fetchData.frameColor = req.body.frameColor;
    fetchData.frameName = req.body.frameName;
    fetchData.frameSize = req.body.frameSize;
    searchQry._id = req.body._id;
    
    if (req.body.frameImage && req.body.frameImage.length > 0) {
        var framesImages = req.body.frameImage;
        var frameArray = [];
        for(var i=0 ; i<framesImages.length ; i ++) {
            if(framesImages[i].imgData != undefined) {
                frameArray.push(framesImages[i]);
            }
        }
        saveImagesInfo(0, frameArray, [], function(resErr, imageArray) {
            if (!resErr) {
                fetchData.frameImages = imageArray;
                for (var j = 0; j < req.body.frameImages.length; j++) {
                    fetchData.frameImages.push(req.body.frameImages[j]);
                }
                frameModel.update(searchQry, {
                    $set: fetchData
                }).exec(function(err, savedData) {
                    if (!err) {
                        var outputJSON = {};
                        outputJSON.status = 200;
                        outputJSON.message = "Frame Successfully edited";
                        res.status(200).send(outputJSON);
                    } else {
                        var outputJSON = {};
                        outputJSON.status = 500;
                        outputJSON.message = "Error while Editing frmaes";
                        outputJSON.error = err;
                        res.status(500).send(outputJSON);
                    }
                });
            } else {
                var outputJSON = {};
                outputJSON.status = 500;
                outputJSON.message = "Error while Saving frmaes";
                outputJSON.error = err;
                res.status(500).send(outputJSON);
            }
        })
    } else {
        fetchData.frameImages = req.body.frameImages;
        frameModel.update(searchQry, {
            $set: fetchData
        }).exec(function(err, savedData) {
            if (!err) {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "Frame Successfully edited";
                res.status(200).send(outputJSON);
            } else {
                var outputJSON = {};
                outputJSON.status = 500;
                outputJSON.message = "Error while Editing frmaes";
                outputJSON.error = err;
                res.status(500).send(outputJSON);
            }
        });
    }
}



/*var saveImagesInfo = function(i, frameArray, imageArray, callb) {
    if (i < frameArray.length) {
        if (frameArray[i].imgData != undefined && frameArray[i].imgData.base64 != "") {
            var imageData = {};
            imageData.base64 = frameArray[i].imgData.base64;
            imageData.filetype = frameArray[i].imgData.filetype;
            imageData.filename = frameArray[i].imgData.filename;
            imageData.isPrimary = frameArray[i].isPrimary;
            imageData.imageType = frameArray[i].imageType;
            // console.log("The Image Data before sended tp getImgPath is : ", imageData.isPrimary + imageData.imageType);
            getImgPath(imageData, function(errorr, imagesPath) {
                if (!errorr) {
                    imageArray.push(imagesPath);
                    saveImagesInfo(++i, frameArray, imageArray, callb);
                } else {
                    console.log("Error in  getImgPath function...", errorr);
                    callb(errorr, 'Unsuccess');
                }
            });
        } else {
            console.log("Frame Image is Undefined", imageArray);
            callb(null, imageArray);
        }
    } else {
        callb(null, imageArray);
    }
}*/



/*var getImgPath = function(imageData, cb) {
    getImage(imageData, function(err, imagePath) {
        if (!err) {
            var imgData = {};
            console.log("getImage Function is getting response -------: ",imagePath);
            imgData.isPrimary = true;
            imgData.imageType = imgData.imageType;
            imgData.imgPath = imgData.imagePath;
            cb(null, imgData);
        } 
        else {
            console.log("Error in Image Uploading...!!!", err);
            cb(err, null);
        }
    });
}*/



/*
***********************************************************
 Function  :  Delete Frames by Admin
 Dated     :  09-August-2017
***********************************************************
*/



exports.deleteFrame = function(req, res) {
    var searchQuery = {};
    searchQuery._id = req.body._id;

    frameModel.find(searchQuery).exec(function(err, frameData) {
        if (!err) {
            if (frameData) {
                var status = true;
                frameModel.update(searchQuery, {
                    $set: {
                        isDeleted: status
                    }
                }, function(resErr, resData) {
                    if (!resErr) {
                        if (resData) {
                            var outputJSON = {};
                            outputJSON.status = 200;
                            outputJSON.message = "Frame deleted successfully.";
                            outputJSON.frameData = resData;
                            res.status(200).send(outputJSON);
                        } else {
                            var outputJSON = {};
                            outputJSON.status = 204;
                            outputJSON.message = "Frame can not be Delete.";
                            res.status(204).send(outputJSON);
                        }
                    } else {
                        var outputJSON = {};
                        outputJSON.status = 500;
                        outputJSON.message = "Something went wrong";
                        outputJSON.error = resErr;
                        res.status(500).send(outputJSON);
                    }
                });
            } else {
                var outputJSON = {};
                outputJSON.status = 204;
                outputJSON.message = "No Frame Found";
                res.status(204).send(outputJSON);
            }
        } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Something went Wrong";
            outputJSON.error = err;
            res.status(500).send(outputJSON);
        }
    })
}


/*
***********************************************************
 Function  :  Delete Frames by Admin
 Dated     :  09-August-2017
***********************************************************
*/


exports.frameDeatils = function(req, res) {
    var fetchData = {};
    fetchData._id = req.body._id;

    frameModel.find(fetchData).exec(function(err, frameData) {
        if (!err) {
            if (frameData) {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "FrameData Success";
                outputJSON.frameData = frameData;
                res.status(200).send(outputJSON);
            } else {
                var outputJSON = {};
                outputJSON.status = 204;
                outputJSON.message = "Frame Data not Found";
                res.status(204).send(outputJSON);
            }
        } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Something Went Wrong";
            outputJSON.error = err;
            res.status(500).send(outputJSON);
        }
    })

}



/*
***********************************************************
 Function  :  Add Frame Colour by Admin
 Dated     :  16-August-2017
***********************************************************
*/

exports.addColour = function(req, res) {
    var fetchData = {};
    fetchData.frameColor = req.body.frameColor;
    colourModel(fetchData).save(function(err, insertdata) {
        if (!err) {
            if (insertdata) {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "Frame Colour Added";
                outputJSON.frameData = insertdata;
                res.status(200).send(outputJSON);
            } else {
                var outputJSON = {};
                outputJSON.status = 204;
                outputJSON.message = "Something Went Wrong";
                res.status(204).send(outputJSON);
            }
        } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Error while adding frame colour";
            outputJSON.error = err;
            res.status(500).send(outputJSON);
        }
    });
}



/*
***********************************************************
 Function  :  list of Frame Colour
 Dated     :  16-August-2017
***********************************************************
*/


exports.frameColours = function(req, res) {
    var searchQuery = {};
    searchQuery.isDeleted = false;
    colourModel.find(searchQuery).exec(function(err, colourData) {
        if (!err) {
            if (colourData) {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "Frame Colours Success";
                outputJSON.frameColours = colourData;
                res.status(200).send(outputJSON);
            } else {
                var outputJSON = {};
                outputJSON.status = 204;
                outputJSON.message = "Frame Colours not Found";
                res.status(204).send(outputJSON);
            }
        } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Something Went Wrong";
            outputJSON.error = err;
            res.status(500).send(outputJSON);
        }
    })
}



/*
***********************************************************
 Function  :  Add Frame Colour by Admin
 Dated     :  16-August-2017
***********************************************************
*/

exports.deleteColor = function(req, res) {
    var searchQry = {};
    var updateQry = {};
    updateQry.isDeleted = true;
    searchQry.frameColor = req.body.frameColor;
    colourModel.update(searchQry, {
        $set: updateQry
    }).exec(function(err, updateData) {
        if (!err) {
            var outputJSON = {};
            outputJSON.status = 200;
            outputJSON.message = "Frame Colour Deleted";
            outputJSON.updateData = updateData;
            res.status(200).send(outputJSON);
        } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Error while Deleting frame colour";
            outputJSON.error = err;
            res.status(500).send(outputJSON);
        }
    });
}



/*
***********************************************************
 Function  :  Delete Frame image from Frame Images
 Dated     :  25-October-2017
***********************************************************
*/

exports.removeFrameImg = function(req, res) {
    var imageId = req.body.imageId;
    
    frameModel.update({_id: req.body.frameId}, { $pull: { 'frameImages': { _id: imageId } } }).exec(function(error, result) {
        if(!error) {    
            var outputJSON = {};
            outputJSON.status = 200;
            outputJSON.message = "Frame image Deleted";
            outputJSON.updateData = result;
            res.status(200).send(outputJSON);
        }
        else {
            var outputJSON = {};
            outputJSON.status = 400;
            outputJSON.message = "Error while Deleting frame image";
            outputJSON.error = error;
            res.status(400).send(outputJSON);
        }
    });
}



/*
***********************************************************
 Function  :  list of Frame Size with their Costs
 Dated     :  22-August-2017
***********************************************************
*/



exports.artSizeCosts = function(req, res) {
    sizeCostModel.find().exec(function(err, frameSizes) {
        if (!err) {
            if (frameSizes) {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "Frame Size & Cost Success";
                outputJSON.frameSizes = frameSizes;
                res.status(200).send(outputJSON);
            } else {
                var outputJSON = {};
                outputJSON.status = 204;
                outputJSON.message = "Frame Size & Cost not Found";
                res.status(204).send(outputJSON);
            }
        } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Something Went Wrong";
            outputJSON.error = err;
            res.status(500).send(outputJSON);
        }
    })
}



/*
***********************************************************
 Function  :  list of All Users
 Dated     :  16-August-2017
***********************************************************
*/




exports.getallUsers = function(req, res) {
    var page = parseInt(req.body.page) || 1;
    var count = parseInt(req.body.count) || 10;
    var skipNo = (page - 1) * count;
    var searchStr = ""
    var query = {};
    var sortkey = null;
    for (key in req.body.sort) {
        sortkey = key;
    }
    var sortquery = {};
    if (sortkey) {
        sortquery[sortkey ? sortkey : '_id'] = req.body.sort ? (req.body.sort[sortkey] == 'desc' ? -1 : 1) : -1;
    }

    if (req.body.search) {
        searchStr = req.body.search;
    }


    query.$and = [{
        "userType": "user",
        "isDeleted": false
    }]
    if (searchStr) {
        query.$or = [{
            email: {
                $regex: searchStr,
                '$options': 'i'
            }
        }, {
            shippingAddress: {
                $regex: searchStr,
                '$options': 'i'
            }
        }]
    }
    userObj.aggregate([{
        $project: {
            _id: "$_id",
            email: "$email",
            shippingAddress: "$shippingAddress",
            isDeleted: "$isDeleted"
        }
    }, {
        $match: query
    }]).exec(function(err, data) {
        if (err) {
            console.log(err)
        } else {
            userObj.aggregate([{
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "userId",
                    as: "UsersOrders"
                }
            }, {
                $match: query
            }, {
                "$sort": sortquery
            }, {
                "$skip": skipNo
            }, {
                "$limit": count
            }]).exec(function(err, result) {
                if (err) {
                    res.status(400).send({
                        "msg": "Some Error",
                        "err": err
                    });
                } else {
                    userObj.aggregate([{
                        $lookup: {
                            from: "orders",
                            localField: "_id",
                            foreignField: "userId",
                            as: "UsersOrders"
                        }
                    }, {
                        $match: query
                    }, {
                        "$sort": sortquery
                    }, {
                        "$skip": skipNo
                    }], function(error, response) {
                        if (!error) {
                            var length = response.length;
                            res.status(200).send({
                                "msg": "Successfully Retrieved",
                                "data": result,
                                "count": length
                            })
                        } else {
                            res.status(400).send({
                                "msg": "Some Error",
                                "err": error
                            });
                        }
                    })
                }
            })
        }
    })

}




/*
***********************************************************
 Function  :  list of All Payment Reports
 Dated     :  25-December-2017
***********************************************************
*/




exports.getPaymentReport = function(req, res) {
    var page = parseInt(req.body.page) || 1;
    var count = parseInt(req.body.count) || 10;
    var skipNo = (page - 1) * count;
  
    var query = {};
    if (req.body.start_Date && req.body.end_Date) {
      var start_Date = new Date(req.body.start_Date);
      var end_Date = new Date(req.body.end_Date);
      start_Date = start_Date.toISOString();
      end_Date = end_Date.toISOString();
  
      var startDateFormat = start_Date.split("T", 1);
      var endDateFormat = end_Date.split("T", 1);
  
      var dateGte = new Date(startDateFormat[0] + "T00:00:00.000Z");
      var dateLte = new Date(endDateFormat[0] + "T23:59:59.000Z");
      query.$and = [
        {
          createdOn: {
            $gte: dateGte,
            $lte: dateLte
          }
        }
      ];
    }
  
    var searchStr = "";
  
    var sortkey = null;
    for (key in req.body.sort) {
      sortkey = key;
    }
    var sortquery = {};
    if (sortkey) {
      sortquery[sortkey ? sortkey : "_id"] = req.body.sort
        ? req.body.sort[sortkey] == "desc" ? -1 : 1
        : -1;
    }
  
    if (req.body.search) {
      searchStr = req.body.search;
      query.$or = [
        {
          createdOn: {
            $regex: searchStr,
            $options: "i"
          }
        },
        {
            transaction_id: {
            $regex: searchStr,
            $options: "i"
          }
        },
        {
            firstName: {
            $regex: searchStr,
            $options: "i"
          }
        },
        {
            payment_method: {
            $regex: searchStr,
            $options: "i"
          }
        },
        {
            payment_status: {
            $regex: searchStr,
            $options: "i"
          }
        }
      ];
    }
  
    if (req.body.id) {
      query.$and = [
        {
          userId: mongoose.Types.ObjectId(req.body.id)
        }
      ];
    }
    orderObj.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "Users"
          }
        },
        {
          $unwind: "$Users"
        },
        {
          $project: {
            _id: "$_id",
            totalPrice: "$totalPrice",
            orderNumber: "$orderNumber",
            createdOn: "$createdOn",
            payment_method : "$payment_method",
            transaction_id : "$transaction_id",
            payment_status : "$payment_status",           
            orderStatus: "$orderStatus",
            firstName: "$Users.billingAddress.firstName"
          }
        },
        {
          $match: query
        },
        {
          $sort: sortquery
        },
        {
          $skip: skipNo
        },
        {
          $limit: count
        }
      ]).exec(function(err, data) {
        if (err) {
          console.log(err);
          res.status(400).send({
            msg: "Some Error",
            err: err
          });
        } else {
          orderObj
            .aggregate([
              {
                $match: query
              }, 
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "Users"
                }
              },
              {
                $unwind: "$Users"
              },
              {
                $project: {
                  _id: "$_id",
                  totalPrice: "$totalPrice",
                  orderNumber: "$orderNumber",
                  createdOn: "$createdOn",
                  payment_method: "$isTemp",
                  transaction_id: "$userId",
                  orderStatus: "$orderStatus",
                  firstName: "$Users.billingAddress.firstName"
                }
              }])
            .exec(function(error, result) {
              if (err) {
                res.status(400).send({
                  msg: "Some Error",
                  err: err
                });
              } else {
                var length = result.length;
                res.status(200).send({
                  msg: "Successfully Retrieved",
                  data: data,
                  count: length
                });
              }
            });
        }
      });
  }



/*
***********************************************************
 Function  :  list of All Orders
 Dated     :  16-August-2017
***********************************************************
*/




exports.getallOrders = function(req, res) {
  var page = parseInt(req.body.page) || 1;
  var count = parseInt(req.body.count) || 10;
  var skipNo = (page - 1) * count;

  var query = {};
  if (req.body.start_Date && req.body.end_Date) {
    var start_Date = new Date(req.body.start_Date);
    var end_Date = new Date(req.body.end_Date);
    start_Date = start_Date.toISOString();
    end_Date = end_Date.toISOString();

    var startDateFormat = start_Date.split("T", 1);
    var endDateFormat = end_Date.split("T", 1);

    var dateGte = new Date(startDateFormat[0] + "T00:00:00.000Z");
    var dateLte = new Date(endDateFormat[0] + "T23:59:59.000Z");
    query.$and = [
      {
        createdOn: {
          $gte: dateGte,
          $lte: dateLte
        }
      }
    ];
  }

  var searchStr = "";

  var sortkey = null;
  for (key in req.body.sort) {
    sortkey = key;
  }
  var sortquery = {};
  if (sortkey) {
    sortquery[sortkey ? sortkey : "_id"] = req.body.sort
      ? req.body.sort[sortkey] == "desc" ? -1 : 1
      : -1;
  }

  if (req.body.search) {
    searchStr = req.body.search;
    query.$or = [
      {
        createdOn: {
          $regex: searchStr,
          $options: "i"
        }
      },
      {
        totalPrice: {
          $regex: searchStr,
          $options: "i"
        }
      },
      {
        email: {
          $regex: searchStr,
          $options: "i"
        }
      },
      {
        firstName: {
          $regex: searchStr,
          $options: "i"
        }
      },
      {
        orderNumber: parseInt(searchStr)
      }
    ];
  }

  if (req.body.id) {
    query.$and = [
      {
        userId: mongoose.Types.ObjectId(req.body.id)
      }
    ];
  }

  orderObj
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "Users"
        }
      },
      {
        $unwind: "$Users"
      },
      {
        $project: {
          _id: "$_id",
          totalPrice: "$totalPrice",
          orderNumber: "$orderNumber",
          createdOn: "$createdOn",
          isTemp: "$isTemp",
          userData: "$Users",
          userId: "$userId",
          orderStatus: "$orderStatus",
          products: "$products",
          firstName: "$Users.billingAddress.firstName"
        }
      },
      {
        $match: query
      },
      {
        $sort: sortquery
      },
      {
        $skip: skipNo
      },
      {
        $limit: count
      }
    ])
    .exec(function(err, data) {
      if (err) {
        res.status(400).send({
          msg: "Some Error",
          err: err
        });
      } else {
        orderObj
          .aggregate([
            {
              $match: query
            }, 
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "Users"
              }
            },
            {
              $unwind: "$Users"
            },
            {
              $project: {
                _id: "$_id",
                totalPrice: "$totalPrice",
                orderNumber: "$orderNumber",
                createdOn: "$createdOn",
                payment_method: "$isTemp",
                userData: "$Users",
                transaction_id: "$userId",
                orderStatus: "$orderStatus",
                products: "$products",
                payment_status: "$Users.billingAddress.firstName"
              }
            }])
          .exec(function(error, result) {
            if (err) {
              res.status(400).send({
                msg: "Some Error",
                err: err
              });
            } else {
              var length = result.length;
              res.status(200).send({
                msg: "Successfully Retrieved",
                data: data,
                count: length
              });
            }
          });
      }
    });
}



/*
***********************************************************
 Function  :  Details Of Orders Selected
 Dated     :  16-August-2017
***********************************************************
*/



exports.getOrderDetail = function(req, res) {
    var id;
    if(req.body.orderId) {
        id = mongoose.Types.ObjectId(req.body.orderId);
    } else {
        id = mongoose.Types.ObjectId(req.params.id);
    }
    
    orderObj.aggregate([{
        $match: {
            "_id" : id
        }
    }, {
        "$unwind": "$products"
    }, {
        $lookup: {
            from: "mats",
            localField: "products.matId",
            foreignField: "_id",
            as: "matData"
        }
    }, {
        $lookup: {
            from: "arts",
            localField: "products.artId",
            foreignField: "_id",
            as: "artData"
        }
    }, {
        $lookup: {
            from: "frames",
            localField: "products.frameId",
            foreignField: "_id",
            as: "frameData"
        }
    }, {
        $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userData"
        }
    }, {
        "$unwind": "$matData"
    }, {
        "$unwind": "$artData"
    }, {
        "$unwind": "$frameData"
    }, {
        "$unwind": "$userData"
    }, {
        $project: {
            _id: "$_id",
            orderNumber : "$orderNumber",
            paymentMethod  : "$payment_method",
            transactionId  : "$transaction_id" ,
            paymentStatus  : "$payment_status", 
            userId : "$userId",
            promoId : "$promoId",
            isGift : "$isGift",
            isPromo : "$isPromo",
            giftMessage : "$giftMessage",
            isTemp: "$isTemp",
            totalPrice: "$totalPrice",
            userData : "$userData",
            createdOn: "$createdOn",
            products: {
                "matData": "$matData",
                "artData": "$artData",
                "frameData": "$frameData",
                "productImage": "$products.productImage",
                "itemPrice": "$products.itemPrice",
                "imageSize": "$products.imageSize"
            }
        }
    }, {
        $group: {
            _id: "$_id",
            "orderNumber": {
              "$first": "$orderNumber"
            },
            "paymentMethod" : {
                "$first": "$paymentMethod"
            },
            "transactionId" : {
                "$first": "$transactionId"
            },
            "paymentStatus" : {
                "$first": "$paymentStatus"
            },
            "createdOn": {
                "$first": "$createdOn"
            },
            "promoId": {
                "$first": "$isGift"
            },
            "isPromo": {
                "$first": "$isPromo"
            },
            "isGift": {
              "$first": "$isGift"
            },
            "giftMessage": {
                "$first": "$giftMessage"
            },
            "userId": {
                "$first": "$userId"
            },
            "totalPrice"  : {
                "$first" : "$totalPrice"
            },
            "userData" : {
              "$first"  : "$userData"
            },
            "products": {
                "$push": "$products"
            }
        }
    }]).exec(function(err, data) {
        if (err) {
            res.status(400).send({
                "msg": "Some Error",
                "err": err
            });
        } else {
            res.status(200).send({
                "msg": "Successfully Retrieved",
                "data": data,
                "imgPath": req.protocol + "://" + req.headers.host
            })
        }
    })
}



/*
***********************************************************
 Function  :  Details of User Order Details
 Dated     :  16-August-2017
***********************************************************
*/



exports.getUserOrderDetail = function(req, res) {
    let id = mongoose.Types.ObjectId(req.params.id);
    orderObj.aggregate([{
        $match: {
            "userId": id
        }
    }, {
        "$unwind": "$products"
    }, {
        $lookup: {
            from: "mats",
            localField: "products.matId",
            foreignField: "_id",
            as: "matData"
        }
    }, {
        $lookup: {
            from: "arts",
            localField: "products.artId",
            foreignField: "_id",
            as: "artData"
        }
    }, {
        $lookup: {
            from: "frames",
            localField: "products.frameId",
            foreignField: "_id",
            as: "frameData"
        }
    }, {
        "$unwind": "$matData"
    }, {
        "$unwind": "$artData"
    }, {
        "$unwind": "$frameData"
    }, {
        $project: {
            _id: "$_id",
            createdOn: "$createdOn",
            isTemp: "$isTemp",
            totalPrice: "$totalPrice",
            products: {
                "matData": "$matData",
                "artData": "$artData",
                "frameData": "$frameData",
                "productImage": "$products.productImage",
                "itemPrice": "$products.itemPrice",
                "imageSize": "$products.imageSize"
            }
        }
    }, {
        $group: {
            _id: "$_id",
            "createdOn": {
                "$first": "$createdOn"
            },
            "isTemp": {
                "$first": "$isTemp"
            },
            "totalPrice": {
                "$first": "$totalPrice"
            },
            "products": {
                "$push": "$products"
            }
        }
    }]).exec(function(err, data) {
        if (err) {
            res.status(400).send({
                "msg": "Some Error",
                "err": err
            });
        } else {
            res.status(200).send({
                "msg": "Successfully Retrieved",
                "data": data,
                "imgPath": req.protocol + "://" + req.headers.host
            })
        }

    })
}


/*
***********************************************************
 Function  :  Details of All Users
 Dated     :  16-August-2017
***********************************************************
*/



exports.getUserDetail = function(req, res) {
    let id = mongoose.Types.ObjectId(req.params.id);
    userObj.aggregate([{
        $match: {
            "_id": id
        }
    }]).exec(function(err, data) {
        if (err) {
            res.status(400).send({
                "msg": "Some Error",
                "err": err
            });
        } else {
            res.status(200).send({
                "msg": "Successfully Retrieved",
                "data": data,
                "imgPath": req.protocol + "://" + req.headers.host
            })
        }

    })
}

/*
***********************************************************
 Function  :  Delete User from Admin
 Dated     :  16-August-2017
***********************************************************
*/


exports.deleteuser = function(req, res) {

    let id = mongoose.Types.ObjectId(req.params.id);
    userObj.update({
        _id: id
    }, {
        $set: {
            isDeleted: true
        }
    }).exec(function(err, result) {
        if (err) {
            res.status(400).send({
                msg: "error",
                "err": err
            });
        } else {
            res.status(200).send({
                msg: 'Successfully updated fields.',
                "user": result,
            });
        }
    })
}

/*
***********************************************************
 Function  :  Active User Status by Admin
 Dated     :  16-August-2017
***********************************************************
*/



exports.undeleteuser = function(req, res) {
    let id = mongoose.Types.ObjectId(req.params.id);
    userObj.update({
        _id: id
    }, {
        $set: {
            isDeleted: false
        }
    }).exec(function(err, result) {
        if (err) {
            res.status(400).send({
                msg: "error",
                "err": err
            });
        } else {
            res.status(200).send({
                msg: 'Successfully updated fields.',
                "user": result,
            });
        }
    })
}



/*
***********************************************************
 Function  :  Download Preoduct Image
 Dated     :  16-August-2017
***********************************************************
*/





exports.getPage = function(req, res) {
    pagesModel.find({}, function(err, pages) {
        if (!err) {
            var outputJSON = {};
            outputJSON.status = 200;
            outputJSON.message = "Pages get Successfully";
            outputJSON.pages = pages;
            res.status(200).send(outputJSON);
        } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Pages get Successfully";
            outputJSON.pages = pages;
            res.status(500).send(outputJSON);
        }
    })
}


exports.createPage = function(req, res) {
    var saveData = {};
    saveData.title = req.body.title;
    saveData.name = req.body.name;
    saveData.content = req.body.content;
    pagesModel(saveData).save(function(err, pageData) {
        if (!err) {
            res.status(200).send("page Saved");
        } else {
            res.status(500).send("page Error");
        }
    })
}


/*________________________________________________________________________________*
@Date: 22 September 2017*
@Method : submitTemplate*
Created By: Akanksha
Modified On: -*
@Purpose:Function to submit Template
.__________________________________________________________________________________*/
exports.submitTemplate = function(req, res) {
    try {
        var name = req.body.title.replace(" ", "-");
        var templateCode = name.toLowerCase();

        var objToSave = {};
        objToSave.title = req.body.title;
        objToSave.content = req.body.content;
        objToSave.templateCode = templateCode;
        objToSave.isDeleted = false;
        objToSave.createdOn = new Date()
        objToSave.seoTitle = req.body.seoTitle;
        objToSave.seoDescription = req.body.seoDescription;

        pagesModel(objToSave).save(function(error, response) {
            if (!error) {
                res.status(200).send('Template created successfully.');
            } else {
                res.status(400).send("Error creating Template.");
            }
        })
    } catch (e) {
        res.status(400).send(e);

    }
}


/*________________________________________________________________________________*
@Date: 23 Oct 2017*
@Method : submitTemplate*
Modified On: -*
@Purpose:Function to submit Template
.__________________________________________________________________________________*/
exports.submitEmailTemplate = function(req, res) {
    try {
        var name = req.body.title.replace(" ", "-");
        var templateCode = name.toLowerCase();

        var objToSave = {};
        objToSave.title = req.body.title;
        objToSave.content = req.body.content;
        objToSave.templateCode = templateCode;
        objToSave.isDeleted = false;
        objToSave.createdOn = new Date()

        emailTemplateModel(objToSave).save(function(error, response) {
            if (!error) {
                res.status(200).send('Email Template created successfully.');
            } else {
                res.status(400).send("Error creating Email Template.");
            }
        })
    } catch (e) {
        res.status(400).send(e);

    }
}

exports.addTemplate = function(req, res) {
    var saveData = {};
    saveData.title = req.body.title;
    saveData.name = req.body.name;
    saveData.content = req.body.content;
    var name = req.body.title.replace(" ", "-");
    saveData.templateCode = name.toLowerCase();
    emailTemplateModel(saveData).save(function(err, pageData) {
        if (!err) {
            res.status(200).send("Email Template Saved");
        } else {
            res.status(500).send("Email Template Error");
        }
    })
}
exports.editTemplate = function(req, res) {
    try {
        var body = req.body;
        var id = req.body._id;
        var title = req.body.title;
        var content = req.body.content;
        emailTemplateModel.findOneAndUpdate({
            "_id": id
        }, {
            $set: {
                "title": title,
                "content": content
            }
        }, {
            upsert: false
        }).exec(function(error, result) {
            if (!error) {
                res.status(200).send(result);
            } else {

                res.status(400).send(error);
            }
        })
    } catch (e) {
        res.status(400).send(e);
    }

}

exports.getTemplate = function(req, res) {
    try {
        var id = req.body.id;
        emailTemplateModel.findOne({
            _id: id
        }).exec(function(err, response) {
            if (!err) {
                res.status(200).send(response);
            } else {
                res.status(400).send(err);
            }
        })
    } catch (e) {
        res.send(400).send(e);
    }
}

exports.listTemplate = function(req, res) {
    var page = parseInt(req.body.page) || 1;
    var count = parseInt(req.body.count) || 10;
    var skipNo = (page - 1) * count;
    var searchStr = ""
    var query = {};
    var sortkey = null;
    for (key in req.body.sort) {
        sortkey = key;
    }
    var sortquery = {};
    if (sortkey) {
        sortquery[sortkey ? sortkey : '_id'] = req.body.sort ? (req.body.sort[sortkey] == 'desc' ? -1 : 1) : -1;
    } else {
        //sortquery['title'] = -1;
    }

    if (req.body.search) {
        searchStr = req.body.search;
    }

    query.$and = [{
        "isDeleted": false
    }]
    if (searchStr) {
        query.$or = [{
            title: {
                $regex: searchStr,
                '$options': 'i'
            }
        }]
    }
    emailTemplateModel.aggregate([{
        $project: {
            _id: "$_id",
            title: "$title",
            isDeleted: "$isDeleted"
        }
    }, {
        $match: query
    }]).exec(function(err, data) {
        if (err) {
            console.log(err)
        } else {
            emailTemplateModel.aggregate([{
                $match: query
            }, {
                "$sort": sortquery
            }, {
                "$skip": skipNo
            }, {
                "$limit": count
            }]).exec(function(err, result) {console.log(err);
                if (err) {
                    res.status(400).send({
                        "msg": "Some Error",
                        "err": err
                    });
                } else {
                    emailTemplateModel.aggregate([{
                        $match: query
                    }, {
                        "$sort": sortquery
                    }, {
                        "$skip": skipNo
                    }], function(error, response) {
                        if (!error) {
                            var length = response.length;
                            res.status(200).send({
                                "msg": "Successfully Retrieved",
                                "data": result,
                                "count": length
                            })
                        } else {
                            res.status(400).send({
                                "msg": "Some Error",
                                "err": error
                            });
                        }
                    })
                }
            })
        }
    })
}



/*
***********************************************************
 Function  :  All Orders Export in a Excel By Admin
 Dated     :  12-October-2017
***********************************************************
*/



exports.exportOrders = function(req, res)
{
	try {
    orderObj.aggregate([{
       "$unwind": "$products"
    }, {
        $lookup: {
            from: "mats",
            localField: "products.matId",
            foreignField: "_id",
            as: "matData"
        }
    }, {
        $lookup: {
            from: "arts",
            localField: "products.artId",
            foreignField: "_id",
            as: "artData"
        }
    }, {
        $lookup: {
            from: "frames",
            localField: "products.frameId",
            foreignField: "_id",
            as: "frameData"
        }
    }, {
          "$unwind": "$products"
    }, {
        "$unwind": "$matData"
    }, {
        "$unwind": "$artData"
    }, {
        "$unwind": "$frameData"
    }, {
        $project: {
            _id: "$_id",
            createdOn: "$createdOn",
            isTemp: "$isTemp",
            orderNumber: "$orderNumber",
            totalPrice: "$totalPrice",
            products: {
                "matData": "$matData",
                "artData": "$artData",
                "frameData": "$frameData",
                "productImage": "$products.productImage",
                "itemPrice": "$products.itemPrice",
                "imageSize": "$products.imageSize"
            }
        }
    }, {
        $group: {
            _id: "$_id",
            "createdOn": {
                "$first": "$createdOn"
            },
            "isTemp": {
                "$first": "$isTemp"
            },
            "orderNumber" : {
                "$first": "$orderNumber"
            },
            "totalPrice": {
                "$first": "$totalPrice"
            },
            "products": {
                "$push": "$products"
            }
        }
    }]).exec(function(err, ordersData) {
			if(!err)
			{
                var ordersArray = [];
                for(var j=0 ; j<ordersData.length ; j++) {
                    var jsonArray = [];
                    for (var i = 0; i < ordersData[j].products.length; i++) {
                        var data = {};
                        data.createdOn       =             ordersData[j].createdOn;
                        data.totalPrice      =             ordersData[j].totalPrice;
                        data.itemPrice       =             ordersData[j].products[i].itemPrice;
                        data.MatColour       =             ordersData[j].products[i].matData.color;
                        data.OptionalPrice   =             ordersData[j].products[i].matData.matPrice;
                        data.MatColour       =             ordersData[j].products[i].matData.color;
                        if(ordersData[j].products[i].artData.artSizeCatagory[0] != undefined) {
                            data.ImageWidth      =             ordersData[j].products[i].artData.artSizeCatagory[0].artSize.width;
                            data.ImageHeight     =             ordersData[j].products[i].artData.artSizeCatagory[0].artSize.height;    
                        }
                        elseexpressdelivery
                        {
                            data.ImageWidth      =             ordersData[j].products[i].artData.artSizeCatagory.artSize.width;
                            data.ImageHeight     =             ordersData[j].products[i].artData.artSizeCatagory.artSize.height;
                        }
                        data.ArtType         =             ordersData[j].products[i].artData.artType;
                        data.frameName       =             ordersData[j].products[i].frameData.frameName;
                        data.frameColor      =             ordersData[j].products[i].frameData.frameColor;
                        jsonArray.push(data);
                    }
                    for(var k=0 ; k<jsonArray.length ; k++){
                        jsonArray[0].OrderNumber = ordersData[j].orderNumber;
                        ordersArray.push(jsonArray[k]);
                    }
                }
                res.xls('orders.xlsx', ordersArray);
			}
			else {
					var resData = {status : 500, message : 'Something went wrong', error : err};
					encryptLib.encryptObj(res, resData);
			}
		});
	} catch (e) {

	}
}





/*
***********************************************************
 Function  :  All Users Export in a Excel By Admin
 Dated     :  17-October-2017
***********************************************************
*/



exports.exportUsers = function(req, res)
{
    var searchQry = {};
    searchQry.isDeleted = false;
    searchQry.userType = 'user';
    userObj.find(searchQry, function(error, users) {
        if(!error && users) {
            var usersList = [];
            for(var i = 0; i < users.length ; i++) {
                var obj = {};
                obj.email = users[i].email;
                if(users[i].shippingAddress != undefined) {
                    obj.shipping_first_name = users[i].shippingAddress.firstName;
                    obj.shipping_last_name = users[i].shippingAddress.lastName;
                    obj.shipping_address1 = users[i].shippingAddress.address1;
                    obj.shipping_zipCode = users[i].shippingAddress.zipCode;
                    obj.shipping_city = users[i].shippingAddress.city;
                    obj.shipping_state = users[i].shippingAddress.state;
                }
                if(users[i].shippingAddress != undefined) {
                    obj.billing = users[i].shippingAddress.firstName;
                    obj.billing_last_name = users[i].shippingAddress.lastName;
                    obj.billing_address1 = users[i].shippingAddress.address1;
                    obj.billing_zipCode = users[i].shippingAddress.zipCode;
                    obj.billing_city = users[i].shippingAddress.city;
                    obj.billing_state = users[i].shippingAddress.state;
                }
                usersList.push(obj);
            }
            res.xls('users.xlsx', usersList);
        }
        else
        {
            var outputJSON = {};
            outputJSON.status = 400;
            outputJSON.message = "Users Not Found";
            outputJSON.error = error;
            res.status(400).send(outputJSON);
        }
    })
}




/*
***********************************************************
 Function  :  All Size and Cost for a Frame
 Dated     :  06-November-2017
***********************************************************
*/


exports.getSizeCost = function(req, res)  {
    sizeCostModel.find({}, function(err, resp) {
        if(!err && resp) {
            var outputJSON = {};
            outputJSON.status = 200;
            outputJSON.message = "Users Not Found";
            outputJSON.sizecostData = resp;
            res.status(200).send(outputJSON);
        } else {
            var outputJSON = {};
            outputJSON.status = 400;
            outputJSON.message = "Error in size cost";
            outputJSON.error = err;
            res.status(400).send(outputJSON);
        }
    })
}   




/*
***********************************************************
 Function  :  All Size and Cost for a Frame
 Dated     :  06-November-2017
***********************************************************
*/

exports.updateSizeCost = function(req, res) {
    var searchQry = {};
    var updateQry = {};
    searchQry._id = req.body._id;
    updateQry.frameSize = (req.body.frameSize.toUpperCase());
    updateQry.frameCost = req.body.frameCost;
    updateQry.upto = {};
    updateQry.upto.height = req.body.upto.height;
    updateQry.upto.width = req.body.upto.width;
    sizeCostModel.update(searchQry, {$set : updateQry}).exec(function(error, updatedData) {
        if(!error) {
            var outputJSON = {};
            outputJSON.status = 200;
            outputJSON.message = "Users Not Found";
            outputJSON.updatedData = updatedData;
            res.status(200).send(outputJSON);
        }
        else {
            var outputJSON = {};
            outputJSON.status = 400;
            outputJSON.message = "Error in size cost update";
            outputJSON.error = error;
            res.status(400).send(outputJSON);
        }
    })

}

/*________________________________________________________________________________*
@Date: 22 September 2017*
@Method : updateTemplate*
Created By: Akanksha
Modified On: -*
@Purpose:Function to update Template
.__________________________________________________________________________________*/
exports.updateTemplate = function(req, res) {
    try {
        var body = req.body;
        var id = req.body.id;
        var filter = {
            "_id": id
        };


        var objToUpdate = {};
        objToUpdate.title = req.body.title;
        objToUpdate.content = req.body.content;
        objToUpdate.seoTitle = req.body.seoTitle;
        objToUpdate.seoDescription = req.body.seoDescription;

        objToUpdate.updatedOn = new Date()
        pagesModel.update({
            "_id": id
        }, {
            $set: objToUpdate
        }).exec(function(error, response) {
            if (!error) {
                res.status(200).send('Data updated successfully.');
            } else {
                res.status(400).send("Error updating Data.");
            }
        })
    } catch (e) {
        res.status(400).send(e);
    }
}



/*________________________________________________________________________________*
@Date: 22 September 2017*
@Method : getAllPages*
Created By: Akanksha
Modified On: -*
@Purpose:Function to get Page Listing
.__________________________________________________________________________________*/
exports.getAllPages = function(req, res) {
    try {
        var query = {};
        var page = req.body.page || 1,
            count = req.body.count || 1;
        var searchQry = req.body.search;
        if (req.body.search) {
            query.title = {
                $regex: searchQry,
                $options: 'i'
            }
        }
        var skipNo = (page - 1) * count;
        query.isDeleted = false;
        pagesModel.aggregate([{
            $match: query
        }, {
            $skip: skipNo
        }, {
            $limit: count
        }]).exec(function(err, response) {
            if (!err) {
                pagesModel.find(query).count().exec(function(err, total) {
                    var outputJSON = {
                        'status': 'success',
                        'messageId': 200,
                        'message': 'data retrieve from products',
                        'data': response,
                        'count': total,
                        'skipNo': skipNo
                    }
                    return res.status(200).send(outputJSON);
                })
            } else {
                res.send(400).status("Error retrieving list!");
            }
        })

    } catch (e) {
        res.status(400).send(e);
    }
}


exports.getstartFramingContent = function(req, res) {
    try {
        var page = req.body.pageCode;
        pagesModel.find({
            "template_code": page
        }).exec(function(err, response) {
            if (!err) {
                res.status(200).send(response);
            } else {
                res.status(400).send(err);
            }
        })
    } catch (e) {
        res.status(400).send(e);
    }
}

exports.getPageData = function(req, res) {
    try {
        var pageId = req.body.id;
        pagesModel.findOne({
            "_id": pageId
        }).exec(function(err, response) {
            if (!err) {
                res.status(200).send(response);
            } else {
                res.status(400).send(err);
            }
        })
    } catch (e) {
        res.status(400).send(e);
    }
}


/*________________________________________________________________________________*
@Date: 23 September 2017*
@Method : deletePageData*
Created By: Akanksha
Modified On: -*
@Purpose:Function to delete Page Data
.__________________________________________________________________________________*/
exports.deletePageData = function(req, res) {
    try {
        var pageId = req.body.id;
        pagesModel.update({
            "_id": pageId
        }, {
            $set: {
                "isDeleted": true
            }
        }).exec(function(error, response) {
            if (!error) {
                res.status(200).send(response);
            } else {
                res.status(400).send(error);
            }
        })
    } catch (e) {
        res.status(400).send(e);
    }
}


/*________________________________________________________________________________*
@Date: 23 September 2017*
@Method : saveOrderStatus*
Created By: Akanksha
Modified On: -*
@Purpose:Function to save Order Status
.__________________________________________________________________________________*/
exports.saveOrderStatus = function(req, res) {
    try {
        var body = req.body;
        var id = req.body._id;
        var orderStatus = req.body.orderStatus;
        orderObj.findOneAndUpdate({
            "_id": id
        }, {
            $set: {
                "orderStatus": orderStatus
            }
        }, {
            upsert: true
        }).exec(function(error, result) {
            if (!error) {
                res.status(200).send(result);
            } else {

                res.status(400).send(error);
            }
        })
    } catch (e) {
        res.status(400).send(e);
    }
}

/*________________________________________________________________________________*
@Date: 25 September 2017*
@Method : submitInspirationData*
Created By: Akanksha
Modified On: -*
@Purpose:Function to submit Inspiration Data
.__________________________________________________________________________________*/
exports.submitInspirationData = function(req, res) {
    try {
        var date = Date.now();
        var currentDate = date.valueOf();
        var imageName = req.body.image.filename;
        var name = imageName + "-" + currentDate;
        var imageType = req.body.image.filetype;
        var filetype = imageType.split('/');
        var type = filetype[1];
        var imageData = req.body.image.base64;
        imageData = "data:" + imageType + ";base64," + imageData;
        decodeBase64Image(imageData, function(imgerr, imgres) {
            if (!imgerr) {
                var pathToStore = path.join(__dirname + './../../public/images/uploads/');
                var imageName = name + "." + type;
                var imagePath = "/images/uploads/" + imageName;

                fs.writeFile(pathToStore + imageName, imgres.data, function(err, img) {
                    if (!err) {
                        var objToSave = {};
                        objToSave.name = req.body.name;
                        objToSave.image = imagePath;
                        inspirationObj(objToSave).save(function(err, response) {
                            if (!err) {

                                res.status(200).send(response);
                            } else {

                                res.status(400).send(err);
                            }
                        })
                    } else {
                        res.status(400).send("Error uploading File");
                    }
                });
            } else {

            }
        })

    } catch (e) {
        res.status(400).send(e);
    }

}

//Function to decode Image
function decodeBase64Image(dataString, callbackData) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};
    if (matches) {
        if (matches.length !== 3) {
            //return new Error('Invalid input string');
            callbackData('invalid string', null);
        } else {
            response.type = matches[1];
            response.data = new Buffer(matches[2], 'base64');
            callbackData(null, response);
        }
    } else {
        callbackData('invalid image', null);

    }
}


/*________________________________________________________________________________*
@Date: 27 September 2017*
@Method : addPromoCode*
Created By: Akanksha
Modified On: -*
@Purpose:Function to save add Promo Code
.__________________________________________________________________________________*/
exports.addPromoCode = function(req, res) {
    var payload = req.body;
    var objToSave = {};
    if (payload.startDate || payload.endDate) {
        var startDate = new Date(payload.startDate);
        objToSave.startDate = startDate;
        var endDate = new Date(payload.endDate);
        objToSave.endDate = endDate;
    } else if (payload.offerCount) {
        objToSave.offerCount = payload.offerCount
    }

    objToSave.promoCode = payload.promoCode.toLowerCase();
    objToSave.description = payload.description;
    objToSave.discount = payload.discount;
    objToSave.offerType = payload.offerType;



    promoObj(objToSave).save(function(err, response) {
        if (!err) {
            res.status(200).send(response);
        } else {
            res.status(400).send(err);
        }
    })
}


/*________________________________________________________________________________*
@Date: 27 September 2017*
@Method : getPromoList*
Created By: Akanksha
Modified On: -*
@Purpose:Function to get Promo List
.__________________________________________________________________________________*/
exports.getPromoList = function(req, res) {
    try {
        var query = {};
        var page = req.body.page || 1,
            count = req.body.count || 1;
        var searchQry = req.body.search;
        if (req.body.search) {
            query.promoCode = {
                $regex: searchQry,
                $options: 'i'
            }
        }
        query.isDeleted = false;
        var sortkey = null;
        for (key in req.body.sort) {
            sortkey = key;
        }
        var sortquery = {};
        if (sortkey) {
            sortquery[sortkey ? sortkey : '_id'] = req.body.sort ? (req.body.sort[sortkey] == 'desc' ? -1 : 1) : -1;
        }
        var skipNo = (page - 1) * count;
        promoObj.aggregate([{
            $match: query
        }, {
            $sort: sortquery
        }, {
            $skip: skipNo
        }, {
            $limit: count
        }]).exec(function(err, response) {
            if (!err) {
                promoObj.find(query).count().exec(function(err, total) {
                    var outputJSON = {
                        'status': 'success',
                        'messageId': 200,
                        'message': 'data retrieve from products',
                        'data': response,
                        'count': total,
                        'skipNo': skipNo
                    }
                    return res.status(200).send(outputJSON);
                })
            } else {
                res.send(400).status("Error retrieving list!");
            }
        })

    } catch (e) {
        res.status(400).send(e);
    }
}

/*________________________________________________________________________________*
@Date: 28 September 2017*
@Method : deletePromoCode*
Created By: Akanksha
Modified On: -*
@Purpose:Function to delete Promo Code
.__________________________________________________________________________________*/
exports.deletePromoCode = function(req, res) {
    try {
        var promoId = req.body.id;
        promoObj.update({
            "_id": promoId
        }, {
            $set: {
                "isDeleted": true
            }
        }).exec(function(error, response) {
            if (!error) {
                res.status(200).send(response);
            } else {
                res.status(400).send(error);
            }
        })
    } catch (e) {
        res.status(400).send(e);
    }
}

/*________________________________________________________________________________*
@Date: 28 September 2017*
@Method : getPromoCodeDetails*
Created By: Akanksha
Modified On: -*
@Purpose:Function to get PromoCode Details
.__________________________________________________________________________________*/
exports.getPromoCodeDetails = function(req, res) {
    try {
        var id = req.body.id;
        promoObj.findOne({
            _id: id
        }).exec(function(error, result) {
            if (!error) {
                res.status(200).send(result);
            } else {
                res.status(400).send(error);
            }
        })
    } catch (e) {
        res.status(400).send(e);
    }
}


/*________________________________________________________________________________*
@Date: 28 September 2017*
@Method : updatePromoCode*
Created By: Akanksha
Modified On: -*
@Purpose:Function to update Template
.__________________________________________________________________________________*/
exports.updatePromoCode = function(req, res) {
    try {
        var body = req.body;
        var id = req.body.id;
        var filter = {
            "_id": id
        };
        var objToUpdate = {};
        objToUpdate.promoCode = req.body.promoCode;
        objToUpdate.description = req.body.description;
        objToUpdate.offerType = req.body.offerType;
        objToUpdate.discount = req.body.discount;
        if (req.body.offerType == 'Limited Offer') {
            objToUpdate.offerCount = req.body.offerCount;
        } else {
            objToUpdate.startDate = req.body.startDate;
            objToUpdate.endDate = req.body.endDate;
        }
        objToUpdate.updatedOn = new Date()
        promoObj.update({
            "_id": id
        }, {
            $set: objToUpdate
        }).exec(function(error, response) {
            if (!error) {
                res.status(200).send('Data updated successfully.');
            } else {
                res.status(400).send("Error updating Data.");
            }
        })
    } catch (e) {
        res.status(400).send(e);
    }
}

/*________________________________________________________________________________*
@Date: 28 September 2017*
@Method : listInspirational*
Created By: Akanksha
Modified On: -*
@Purpose:Function to list Inspirational data
.__________________________________________________________________________________*/
exports.listInspirational = function(req, res) {
    try {
        var query = {};
        var page = req.body.page || 1,
            count = req.body.count || 1;
        var searchQry = req.body.search;
        if (req.body.search) {
            query.name = {
                $regex: searchQry,
                $options: 'i'
            }
        }
        query.isDeleted = false;
        var sortkey = null;
        for (key in req.body.sort) {
            sortkey = key;
        }
        var sortquery = {};
        if (sortkey) {
            sortquery[sortkey ? sortkey : '_id'] = req.body.sort ? (req.body.sort[sortkey] == 'desc' ? -1 : 1) : -1;
        }
        var skipNo = (page - 1) * count;
        inspirationObj.aggregate([{
            $match: query
        }, {
            $sort: sortquery
        }, {
            $skip: skipNo
        }, {
            $limit: count
        }]).exec(function(err, response) {
            if (!err) {
                inspirationObj.find(query).count().exec(function(err, total) {
                    var outputJSON = {
                        'status': 'success',
                        'messageId': 200,
                        'message': 'data retrieve from products',
                        'data': response,
                        'count': total,
                        'skipNo': skipNo
                    }
                    return res.status(200).send(outputJSON);
                })
            } else {
                res.send(400).status("Error retrieving list!");
            }
        })

    } catch (e) {
        res.status(400).send(e);
    }
}

/*________________________________________________________________________________*
@Date: 28 September 2017*
@Method : deleteInspirationalData*
Created By: Akanksha
Modified On: -*
@Purpose:Function to delete Inspirational data
.__________________________________________________________________________________*/
exports.deleteInspirationalData = function(req, res) {
    try {
        var inspirationId = req.body.id;
        inspirationObj.update({
            "_id": inspirationId
        }, {
            $set: {
                "isDeleted": true
            }
        }).exec(function(error, response) {
            if (!error) {
                res.status(200).send(response);
            } else {
                res.status(400).send(error);
            }
        })
    } catch (e) {
        res.status(400).send(e);
    }
}

/*________________________________________________________________________________*
@Date: 28 September 2017*
@Method : getInspirationalData*
Created By: Akanksha
Modified On: -*
@Purpose:Function to get Inspirational Data
.__________________________________________________________________________________*/
exports.getInspirationalData = function(req, res) {
    try {
        var id = req.body.id;
        inspirationObj.findOne({
            _id: id
        }).exec(function(error, result) {
            if (!error) {
                res.status(200).send(result);
            } else {
                res.status(400).send(error);
            }
        })
    } catch (e) {
        res.status(400).send(e);
    }
}



/*________________________________________________________________________________*
@Date: 28 September 2017*
@Method : updateInspirationData*
Created By: Akanksha
Modified On: -*
@Purpose:Function to Update Inspirational Data
.__________________________________________________________________________________*/

exports.updateInspirationData = function(req, res) {
    try {
        var searchQry = {};
        searchQry._id = req.body._id;
        if (req.body.editImage) {
            var date = Date.now();
            var currentDate = date.valueOf();
            var imageName = req.body.editImage.filename;
            var name = imageName + "-" + currentDate;
            var imageType = req.body.editImage.filetype;
            var filetype = imageType.split('/');
            var type = filetype[1];
            var imageData = req.body.editImage.base64;
            imageData = "data:" + imageType + ";base64," + imageData;
            decodeBase64Image(imageData, function(imgerr, imgres) {
                if (!imgerr) {
                    var pathToStore = path.join(__dirname + './../../public/images/uploads/');
                    var imageName = "inspirational" + "-" + name + "." + type;
                    var imagePath = "/images/uploads/" + imageName;

                    fs.writeFile(pathToStore + imageName, imgres.data, function(err, img) {
                        if (!err) {
                            var objToUpdate = {};
                            objToUpdate.name = req.body.name;
                            objToUpdate.image = imagePath;
                            inspirationObj.update(searchQry, {
                                $set: objToUpdate
                            }).exec(function(err, response) {
                                if (!err) {
                                    res.status(200).send(response);
                                } else {
                                    res.status(400).send(err);
                                }
                            })
                        } else {
                            res.status(400).send("Error uploading File");
                        }
                    });
                } else {
                    res.status(500).send("Error in decoding base 64 " + imgerr);
                }
            });
        } else {
            var objToUpdate = {};
            objToUpdate.name = req.body.name;
            inspirationObj.update(searchQry, {
                $set: objToUpdate
            }).exec(function(err, response) {
                if (!err) {
                    res.status(200).send(response);
                } else {
                    res.status(400).send(err);
                }
            })
        }


    } catch (e) {
        res.status(400).send(e);
    }

    //Function to decode Image
    function decodeBase64Image(dataString, callbackData) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
        if (matches) {
            if (matches.length !== 3) {
                //return new Error('Invalid input string');
                callbackData('invalid string', null);
            } else {
                response.type = matches[1];
                response.data = new Buffer(matches[2], 'base64');
                callbackData(null, response);
            }
        } else {
            callbackData('invalid image', null);

        }
    }
}

/*________________________________________________________________________________*
@Date: 03 October 2017*
@Method : addSEO*
Created By: Akanksha
Modified On: -*
@Purpose:Function to add SEO Data
.__________________________________________________________________________________*/
exports.addSEO = function(req, res) {
    try {
        var payload = req.body;
        var objToSave = {};
        objToSave.keyword = payload.keyword;
        objToSave.description = payload.description;
        objToSave.type = payload.type;
        seoObj(objToSave).save(function(err, response) {
            if (!err) {
                res.status(200).send(response);
            } else {
                res.status(400).send(err);
            }
        })
    } catch (e) {
        res.status(400).send(err);
    }
}

/*________________________________________________________________________________*
@Date: 03 October 2017*
@Method : addSEO*
Created By: Akanksha
Modified On: -*
@Purpose:Function to add SEO Data
.__________________________________________________________________________________*/
exports.listSEO = function(req, res) {
    seoObj.find().exec(function(err, response) {
        if (!err) {
            res.status(200).send(response);
        } else {
            res.status(400).send(err);
        }
    })
}

/*________________________________________________________________________________*
@Date: 03 October 2017*
@Method : addSEO*
Created By: Akanksha
Modified On: -*
@Purpose:Function to add SEO Data
.__________________________________________________________________________________*/
exports.updateSEO = function(req, res) {
    try {
        var payload = req.body;
        var id = payload._id;
        var objToUpdate = {};
        objToUpdate.keyword = payload.keyword;
        objToUpdate.description = payload.description;
        objToUpdate.type = payload.type;

        seoObj.update({
            "_id": id
        }, {
            $set: objToUpdate
        }).exec(function(error, response) {
            if (!error) {
                res.status(200).send(response);
            } else {
                res.status(400).send(error);
            }
        })
    } catch (e) {
        res.status(400).send(error);
    }
}


/*________________________________________________________________________________*
@Date: 12 October 2017*
@Method : getDetails*
Created By: Akanksha
Modified On: -*
@Purpose:Function to get User Details
.__________________________________________________________________________________*/
exports.getDetails = function(req, res) {
    try {
        var id = req.body.id;
        userObj.findOne({
            _id: id
        }).exec(function(error, response) {
            if (!error) {
                res.status(200).send(response);
            } else {

                res.status(400).send(error);
            }
        })
    } catch (e) {
        res.status(400).send(error);
    }
}


/*________________________________________________________________________________*
@Date: 12 October 2017*
@Method : updateUserDetails*
Created By: Akanksha
Modified On: -*
@Purpose:Function to update User Details
.__________________________________________________________________________________*/
exports.updateUserDetails = function(req, res) {
    try {
        var data = req.body.info;
        var id = data.user_details.id;
        var objToUpdate = {};
        objToUpdate.email = data.user_details.email;
        objToUpdate.billingAddress = data.billing_details;
        objToUpdate.shippingAddress = data.shipping_details;
        userObj.update({
            "_id": id
        }, {
            $set: objToUpdate
        }).exec(function(error, response) {
            if (!error) {
                res.status(200).send(response);
            } else {
                res.status(400).send(error);
            }
        })
    } catch (e) {
        res.status(400).send(e);
    }
}


/*________________________________________________________________________________*
@Date: 14 October 2017*
@Method : addETA*
Created By: Akanksha
Modified On: -*
@Purpose:Function to add ETA
.__________________________________________________________________________________*/
exports.addETA = function(req, res) {
    try {
        var data = req.body.days.estimatedDays;
        var objToSave = {};
        objToSave.estimatedDays = parseInt(data);
        checkOutObj(objToSave).save(function(err, response) {
            if (!err) {
                res.status(200).send(response);
            } else {
                res.status(400).send(err);
            }
        })
    } catch (e) {
        res.send(400).send(e);
    }
}

/*________________________________________________________________________________*
@Date: 14 October 2017*
@Method : getCheckoutDetails*
Created By: Akanksha
Modified On: -*
@Purpose:Function to get Checkout Details
.__________________________________________________________________________________*/
exports.getCheckoutDetails = function(req, res) {
    try {
        checkOutObj.findOne().exec(function(err, response) {
            if (!err) {
                res.status(200).send(response);
            } else {
                res.status(400).send(err);
            }

        })
    } catch (e) {
        res.send(400).send(e);
    }

}

/*________________________________________________________________________________*
@Date: 14 October 2017*
@Method : updateETA*
Created By: Akanksha
Modified On: -*
@Purpose:Function to updateETA
.__________________________________________________________________________________*/
exports.updateETA = function(req, res) {
    try {
        var data = req.body.days.estimatedDays;
        var id = req.body.days.id;
        var objToUpdate = {};
        objToUpdate.estimatedDays = data;
        checkOutObj.update({
            _id: id
        }, {
            $set: objToUpdate
        }).exec(function(err, response) {
            if (!err) {
                res.status(200).send(response);
            } else {
                res.status(400).send(err);
            }
        })
    } catch (e) {
        res.send(400).send(e);
    }
}





/*________________________________________________________________________________*
@Date: 12 December 2017*
@Method : addDelivery*
Created By: Dikshit
Modified On: -*
@Purpose:Function to add Delivery Charges
.__________________________________________________________________________________*/
exports.addDelivery = function(req, res) {
    try {
        var data = req.body.days.estimatedDays;
        var objToSave = {};
        objToSave.deliveryCharges = parseInt(data);
        expressdelivery(objToSave).save(function(err, response) {
            if (!err) {
                res.status(200).send(response);
            } else {
                res.status(400).send(err);
            }
        })
    } catch (e) {
        res.send(400).send(e);
    }
}

/*________________________________________________________________________________*
@Date: 14 October 2017*
@Method : getDeliveryDetails*
Created By: Dikshit
Modified On: -*
@Purpose:Function to get Express Delivery Details
.__________________________________________________________________________________*/
exports.getDeliveryDetails = function(req, res) {
    try {
        expressdelivery.findOne().exec(function(err, response) {
            if (!err) {
                res.status(200).send(response);
            } else {
                res.status(400).send(err);
            }

        })
    } catch (e) {
        res.send(400).send(e);
    }

}

/*________________________________________________________________________________*
@Date: 14 October 2017*
@Method : updateDelivery*
Created By: Dikshit
Modified On: -*
@Purpose:Function to updateDelivery
.__________________________________________________________________________________*/
exports.updateDelivery = function(req, res) {
    try {
        var data = req.body.deliveryCharges.expressDelivery;
        var id = req.body.deliveryCharges.id;
        var objToUpdate = {};
        objToUpdate.deliveryCharges = data;
        
        expressdelivery.update({
            _id: id
        }, {
            $set: objToUpdate
        }).exec(function(err, response) {
            if (!err) {
                res.status(200).send(response);
            } else {
                res.status(400).send(err);
            }
        })
    } catch (e) {
        res.send(400).send(e);
    }
}






exports.getSEOValue = function(req, res) {
    try {
        var id = req.body.id;
        seoObj.findOne({
            _id: id
        }).exec(function(err, response) {
            if (!err) {
                res.status(200).send(response);
            } else {
                res.status(400).send(err);
            }
        })
    } catch (e) {
        res.send(400).send(e);
    }
}

exports.updateSEO = function(req, res) {
    try {
        var data = req.body.data;
        var id = data._id;
        var objToUpdate = {};
        objToUpdate.keyword = data.keyword;
        objToUpdate.description = data.description;
        objToUpdate.type = data.type;
        seoObj.update({
            "_id": id
        }, {
            $set: objToUpdate
        }).exec(function(err, response) {
            if (!err) {
                res.status(200).send(response);
            } else {
                res.status(400).send(err);
            }
        })
    } catch (e) {
        res.send(400).send(e);
    }
}

//END
