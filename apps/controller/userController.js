var mongoose = require('mongoose');
var fs = require('fs');
var constant = require('./../../constant.js');
var framesModel = require('./../model/framesModel');
var usersModel = require('./../model/users');
var ordersModel = require('./../model/orderModel');
var artModel = require('./../model/artModel');
var sizeCostModel = require('./../model/frameSizeCostModel');
var colourModel = require('./../model/framesColour'); 
var matModel = require("./../model/matModel");
var cartModel = require('./../model/cartModel');
var seoObj = require('./../model/seoModel.js');
var promoModel = require('./../model/promoCodeModel');
var promoUsed = require('./../model/promo_used_Model');
var pagesModel = require('./../model/pagesModel');
var checkOutModel = require('./../model/checkOutModel');
var inspirationObj = require('./../model/inspirationalModel');
var emailTemplateModel = require('./../model/emailTemplateModel');
var stripe = require('stripe')('sk_test_GxXdLb24s9fCIgyKLCoZmaIA');
var path = require('path');
var randDig = require("random-key");
var nodemailer = require('nodemailer');
var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('./scratch');




var discountedPrice = constant.Discount;
var transporter = nodemailer.createTransport(constant.nodemailer);




    
/*
***********************************************************
 Function  :  Function to save the image into Local Folder
 Dated     :  24-August-2017
***********************************************************
*/


var getImage = function(imagesdata, cd) {
  {
    var date = Date.now();
    var currentDate = date.valueOf();
    var imageName = imagesdata.filename;
    var name = imageName + "-" + currentDate;
    var imageType = imagesdata.filetype;
    var filetype = imageType.split('/');
    var type = filetype[1];
    var imageData = imagesdata.base64;
    imageData = "data:" + imagesdata.filetype + ";base64," + imageData;
     
    decodeBase64Images(imageData, function(imgerr, imgres) {
      if (!imgerr) {
        var pathToStore = path.join(__dirname + './../../public/images/uploads/');
        var imageName = name + "." + type;
        var imagePath = "/images/uploads/" + imageName;
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


    // Image Need to compress here
    

    /*LZUTF8.compressAsync(imageData, {inputEncoding: "Base64",outputEncoding: "Base64"}, function (result, error) {
      if (error === undefined) {
          console.log("Here Old base 64 length is : ", imageData.length);
          var compressedBase64 = "data:" + imagesdata.filetype + ";base64," + result;
          console.log("Here new base64 is : ", compressedBase64);
          decodeBase64Image(compressedBase64, function(imgerr, imgres) {
            if (!imgerr) {
              var pathToStore = path.join(__dirname + './../../public/images/uploads/');
              var imageName = name + "." + type;
              var imagePath = "/images/uploads/" + imageName;
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
      } else {
          console.log("Compression error: " + error.message);
      }
    });*/

  }
}



/*
***********************************************************
 Function  :  Function to decode base64 Data into image
 Dated     :  24-August-2017
***********************************************************
*/


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
 Function  :  Function to Get user
 Dated     :  01-November-2017
***********************************************************
*/
exports.getUserDetails = function(req, res) {
    if(req.session.user != undefined) {
      usersModel.findOne({"_id" : req.session.user._id}, function(err, user) {
        if(!err) {
          req.session.user = user;
          var outputJSON = {};
          outputJSON.status = 200;
          outputJSON.message = "User Logged in";
          outputJSON.userData = user;
          res.status(200).send(outputJSON);
        }
        else {
          var outputJSON = {};
          outputJSON.status = 400;
          outputJSON.message = "Error in User Data";
          outputJSON.error = err;
          res.status(400).send(outputJSON);
        }
      });
    } else {
      console.log("Not in Session");
    }
}

/*
***********************************************************
 Function  :  Function to check User Session
 Dated     :  12-September-2017
***********************************************************
*/


exports.checkSession = function(req, res) {
  try {
    if (req.session.user) {
      var userData = req.session.user;
      var outputJSON = {};
      outputJSON.status = 200;
      outputJSON.message = "User Logged in";
      outputJSON.userData = userData;
      res.status(200).send(outputJSON);
    } else {
      var outputJSON = {};
      outputJSON.status = 204;
      outputJSON.message = "No User Logged i";
      res.status(204).send(outputJSON);
    }

  } catch (e) {

  }
}


/*
***********************************************************
 Function  :  Function to creating session for new temp user
 Dated     :  24-August-2017
***********************************************************
*/


exports.tempCart = function(req, res) {
  var saveInfo = {};
  if (req.session.user != undefined) {
    saveInfo.userId = req.session.user._id;
    saveInfo.tempUserId = req.body.cookie;
    saveInfo.isTemp = false;
  } else if (req.session.guestUser != undefined && req.session.user == undefined) {
    saveInfo.userId = req.session.guestUser._id;
    saveInfo.tempUserId = req.body.cookie;
    saveInfo.isTemp = false;
  } else {
    saveInfo.tempUserId = req.body.cookie;
    saveInfo.isTemp = true;
  }


  cartModel(saveInfo).save(function(err, cartData) {
    if (!err && cartData) {
      var outputJSON = {};
      outputJSON.status = 200;
      outputJSON.message = "Cart Successfully Added";
      outputJSON.cartData = cartData;
      res.status(200).send(outputJSON);
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error in Cart Data";
      outputJSON.error = err;
      res.status(500).send(outputJSON);
    }
  });
}



/*
***********************************************************
 Function  :  Create new temp cart
 Dated     :  20-September-2017
***********************************************************
*/


var newTempCart = function(req, callBackTemp) {
  var saveInfo = {};

  if (req.session.user != undefined) {
    saveInfo.userId = req.session.user._id;
    saveInfo.isTemp = false;
  } else if (req.session.guestUser != undefined && req.session.user == undefined) {
    saveInfo.userId = req.session.guestUser._id;
    saveInfo.isTemp = false;
  } else {
    saveInfo.tempUserId = req.cookies.qwertyuiop;
    saveInfo.isTemp = true;
  }

  cartModel(saveInfo).save(function(err, cartData) {
    if (!err) {
      var outputJSON = {};
      outputJSON.status = 200;
      outputJSON.message = "Cart Successfully Added";
      outputJSON.cartData = cartData;
      callBackTemp(null, outputJSON);
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error in Cart Data";
      outputJSON.error = err;
      callBackTemp(err, 'Cart can not created.');
    }
  });
}



/*
***********************************************************
 Function  :  Get Temp User Details
 Dated     :  7-Sept-2017
***********************************************************
*/

var getTempUser = function(req, cbTemp) {
  if (req.cookies.qwertyuiop != "") {
    var searchQry = {};
    if (req.session.user != undefined) {
      searchQry.userId = req.session.user._id;
      searchQry.isTemp = false;
    } else if (req.session.guestUser != undefined && req.session.user == undefined) {
      searchQry.userId = req.session.guestUser._id;
      searchQry.isTemp = false;
    } else {
      searchQry.tempUserId = req.cookies.qwertyuiop;
      searchQry.isTemp = true;
    }
    cartModel.findOne(searchQry, function(err, cartData) {
      if (!err) {
        if(cartData){
           cbTemp(null, cartData);
        } else {
          newTempCart(req, function(newErr, newRes) {
            if(!newErr) {
              cbTemp(null, newRes.cartData)
            } else {
              cbTemp(newErr, null);
            }
          })
        }
      } else {
        cbTemp(err, null);
      }
    });
  } else {
    cbTemp('error', 'No Cookie available for any User');
  }
}



/*
***********************************************************
 Function  :  Get Logout from the current login user
 Dated     :  21-Sept-2017
***********************************************************
*/



exports.logout = function(req, res) {
  req.session.destroy();
  if (req.session == undefined) {
    var outputJSON = {};
    outputJSON.status = 200;
    outputJSON.message = "Logout Success Response";
    res.status(200).send(outputJSON);
  } else {
    var outputJSON = {};
    outputJSON.status = 304;
    outputJSON.message = "Logout Error Response";
    res.status(304).send(outputJSON);
  }
}



/*
***********************************************************
 Function  :  Function to list all the frames in the DB
 Dated     :  24-August-2017
***********************************************************
*/


exports.framesList = function(req, res) {
  try {
    var page = req.body.pageno || 1;
    var count = req.body.itemsPerPage || 1;

    var searchQry = "";
    if (req.body.searchColor == "ALL") {
      searchQry = "";
    }
    if ((req.body.searchColor) && (req.body.searchColor != "ALL")) {
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
    framesModel.aggregate([{
      $match: filter
    }]).exec(function(err, frameData) {
      if (!err) {
        if (frameData) {
          var outputJSON = {};

          framesModel.find(filter).count().exec(function(err, total) {
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
 Function  :  list of Frame Colour
 Dated     :  7-Sept-2017
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
 Function  :  Function to get the selected frame and update the order with relative frame
 Dated     :  24-August-2017
***********************************************************
*/



exports.getFrame = function(req, res) {
  var searchQry = {};
  var fetchInfo = {};
  var updateQry = {};

  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) {
      fetchInfo._id = req.body.id;
      searchQry._id = cbSuccess._id;
      framesModel.findOne(fetchInfo).exec(function(err, frameData) {
        if (!err) {
          if (frameData) {
            var length = cbSuccess.products.length - 1;
            var prodId = cbSuccess.products[length]._id

            cartModel.update({
              _id: cbSuccess._id,
              "products._id": prodId
            }, {
              $set: {
                "products.$.frameId": frameData._id
              }
            }).exec(function(error, updatedCart) {
              if (!error) {
                if (updatedCart) {
                  cartModel.findOne(searchQry).exec(function(resErr, cartData) { // get order funtion
                    if (!resErr) {
                      if (cartData) {
                        var outputJSON = {};
                        outputJSON.status = 200;
                        outputJSON.message = "Frame Successfully Get";
                        outputJSON.frameData = frameData;
                        outputJSON.cartData = cartData;
                        res.status(200).send(outputJSON);
                      } else {
                        var outputJSON = {};
                        outputJSON.status = 204;
                        outputJSON.message = "Something went wrong with cart";
                        outputJSON.frameData = frameData;
                        res.send(204).send(outputJSON);
                      }
                    } else {
                      var outputJSON = {};
                      outputJSON.status = 500;
                      outputJSON.message = "Error in Cart";
                      outputJSON.frameData = frameData;
                      outputJSON.error = resErr;
                      res.status(500).send(outputJSON);
                    }
                  }); //End of get Order Function
                } else {
                  var outputJSON = {};
                  outputJSON.status = 204;
                  outputJSON.message = "Something went wrong with cart";
                  outputJSON.frameData = frameData;
                  res.send(204).send(outputJSON);
                }
              } else {
                var outputJSON = {};
                outputJSON.status = 500;
                outputJSON.message = "Error in updating Cart";
                outputJSON.frameData = frameData;
                outputJSON.error = error;
                res.status(500).send(outputJSON);
              }
            }); //End of update Order Function
            //End Of Orders Data Table for Temp User
          } else {
            var outputJSON = {};
            outputJSON.status = 204;
            outputJSON.message = "Something went wrong with frames";
            res.send(204).send(outputJSON);
          }
        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Error in Frames";
          outputJSON.error = err;
          res.status(500).send(outputJSON);
        }
      });
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}



/*
***********************************************************
 Function  :  Function to save digital photo for a temp user
 Dated     :  24-August-2017
***********************************************************
*/



exports.saveDigitalImage = function(req, res) {
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr && cbSuccess != null) {
      console.log("Safe here");
      newDigitalImage(req, res, cbSuccess);
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Temp User having error";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}


/*
***********************************************************
 Function  :  Function to save art Work for a temp user
 Dated     :  17-Oct-2017
***********************************************************
*/


exports.saveArtImage = function(req, res) {
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr && cbSuccess != null) {
        newDigitalImage(req, res, cbSuccess);
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Temp User having error";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}



/*
*********************************************************************
 Function  :  Function to save digital photo for a login or temp User
 Dated     :  20-September-2017
*********************************************************************
*/



var newDigitalImage = function(req, res, cbSuccess) {
  var artType = req.body.artType;
  var fetchData = {};
  var saveInfo = {};
  saveInfo.products = [];
  saveInfo.imageSize = {};
  var searchQry = {};
  searchQry._id = cbSuccess._id;

  if (artType == "Digital") {
    fetchData.digitalPhoto = req.body.digitalPhoto
  } else if (artType == "Instagram") {
    fetchData.digitalPhoto = req.body.digitalPhoto
  } else {
    fetchData.digitalPhoto = req.body.artWork;
  }

  if(req.body.artWork && req.body.artWork.imagePath != undefined) {
    var productInfo = {};
    productInfo.productImage = "/" + req.body.artWork.imagePath;
    productInfo.imageSize = {};
    productInfo.imageSize.width = req.body.width;
    productInfo.imageSize.height = req.body.height;
    productInfo.isDigital = req.body.isDigital;
    productInfo.artType = req.body.artType;
    saveInfo.products = productInfo;
    cartModel.findOneAndUpdate(searchQry, { $push: saveInfo }, { new: true }, function(err, cartData) {
      if (!err && cartData) {
        var outputJSON = {};
        outputJSON.status = 200;
        outputJSON.message = "Cart Successfully Updated";
        outputJSON.cartData = cartData;
        res.status(200).send(outputJSON);
      } else {
        var outputJSON = {};
        outputJSON.status = 500;
        outputJSON.message = "Error in Cart Data";
        outputJSON.error = err;
        res.status(500).send(outputJSON);
      }
    });
  } else {
      getImage(fetchData.digitalPhoto, function(error, resSucc) {
        if (!error) {
          var productInfo = {};
          productInfo.productImage = resSucc
          productInfo.imageSize = {};
          productInfo.imageSize.width = req.body.width;
          productInfo.imageSize.height = req.body.height;
          productInfo.isDigital = req.body.isDigital;
          productInfo.artType = req.body.artType;
          saveInfo.products = productInfo;
          cartModel.findOneAndUpdate(searchQry, { $push: saveInfo }, { new: true }, function(err, cartData) {
            if (!err && cartData) {
              var outputJSON = {};
              outputJSON.status = 200;
              outputJSON.message = "Cart Successfully Updated";
              outputJSON.cartData = cartData;
              res.status(200).send(outputJSON);
            } else {
              var outputJSON = {};
              outputJSON.status = 500;
              outputJSON.message = "Error in Cart Data";
              outputJSON.error = err;
              res.status(500).send(outputJSON);
            }
          });
        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Digital Photo not Added";
          outputJSON.error = error;
          res.status(500).send(outputJSON);
        }
      });
  }
}



/*
***********************************************************
 Function  :  Function to get Carts
 Dated     :  28-August-2017
***********************************************************
*/



exports.getCart = function(req, res) {
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) {
      if (cbSuccess) {
        if(cbSuccess.products.length) {
          var searchQry = {};
          var length = cbSuccess.products.length - 1;
          searchQry._id = cbSuccess.products[length].artId;
          artModel.findOne(searchQry, function(error, artData) {
            if (!error) {
              var outputJSON = {};
              outputJSON.status = 200;
              outputJSON.message = "Cart Successfully Updated";
              outputJSON.cartData = cbSuccess;
              outputJSON.artData = artData;
              res.status(200).send(outputJSON);
            } else {
              var outputJSON = {};
              outputJSON.status = 500;
              outputJSON.message = "Error in Art Data";
              outputJSON.error = error;
              res.status(500).send(outputJSON);
            }
          });
        } else {
          var outputJSON = {};
          outputJSON.status = 400;
          outputJSON.message = "No Products in Cart";
          outputJSON.cartData = cbSuccess;
          res.status(400).send(outputJSON);
        }
      } else {
        var outputJSON = {};
        outputJSON.status = 204;
        outputJSON.message = "No Cart Data";
        res.status(204).send(outputJSON);
      }
    } else {
      var outputJSON = {};
      outputJSON.status = 400;
      outputJSON.message = "Temp User having error";
      outputJSON.error = cbErr;
      res.status(400).send(outputJSON);
    }
  });
}




/*
***********************************************************
 Function  :  Function to add product to the compare list
 Dated     :  07-November-2017
***********************************************************
*/
exports.addToComapre = function(req, res) {
  var matId = req.body.matId;
  gettingMatPrice(matId, function(matErr, matSucc) {
    if (!matErr) {
      var matPrice = matSucc.matPrice;
      getTempUser(req, function(cbErr, cbSuccess) {
        if (!cbErr && cbSuccess) {
          var length = cbSuccess.products.length - 1;
          var itemPrice = cbSuccess.products[length].itemPrice + matPrice;
          var cartId = cbSuccess._id;
          var prodId = cbSuccess.products[length]._id;
          cartModel.update({"_id": cartId,"products._id": prodId}, {
            $set: {
              "products.$.matId": matId,
              "products.$.itemPrice": itemPrice
            }
          }).exec(function(error , success) {
            if(!error) {
              var compareArray = [];
              var obj = {};
              if(localStorage.getItem("compareArray")) {
                var data = JSON.parse(localStorage.getItem("compareArray"));
                compareArray = data;
              }
              obj.cartId = cartId;
              obj.productId = prodId;
              obj.matId = matId;
              compareArray.push(obj);
              localStorage.setItem("compareArray", JSON.stringify(compareArray));
              var data = localStorage.getItem("compareArray");
              var outputJSON = {};
              outputJSON.status = 200;
              outputJSON.message = "Successfully saved into locastorage";
              outputJSON.compareData = JSON.parse(data);
              res.status(200).send(outputJSON);
            } else {
              var outputJSON = {};
              outputJSON.status = 400;
              outputJSON.message = "Error in updating cart values";
              outputJSON.error = error;
              res.status(400).send(outputJSON);
            }
          });
        } else {
          var outputJSON = {};
          outputJSON.status = 400;
          outputJSON.message = "Temp User having error";
          outputJSON.error = cbErr;
          res.status(400).send(outputJSON);
        }
      });
    } else {
      var outputJSON = {};
      outputJSON.status = 400;
      outputJSON.message = "Error in mat price";
      outputJSON.error = matErr;
      res.status(400).send(outputJSON);
    }
  });
}



/*
***********************************************************
 Function  :  Function to get compare Details for Addd to cart
 Dated     :  07-November-2017
***********************************************************
*/

exports.getCompareProducts = function(req, res) {
  var data = JSON.parse(localStorage.getItem("compareArray"));
  if(data && data.length) {
    getDetailData(0, [], data, function(error, response) {
      if(!error && response) {
        var outputJSON = {};
        outputJSON.status = 200;
        outputJSON.message = "Successfully saved into locastorage";
        outputJSON.compareData = response;
        res.status(200).send(outputJSON);
      } else {
        var outputJSON = {};
        outputJSON.status = 400;
        outputJSON.message = "Error in getting products value";
        outputJSON.error = error;
        res.status(400).send(outputJSON);
      }
    });
  } else {
    var outputJSON = {};
    outputJSON.status = 400;
    outputJSON.message = "No products in Compare";
    outputJSON.compareData = data;
    res.status(400).send(outputJSON);
  }
}

var getDetailData = function(i, newArray, data, cb) {
  if(i != data.length) {
    cartModel.aggregate([{
      $match : { 
              "_id" : mongoose.Types.ObjectId(data[i].cartId)
      }
    }, {
        "$unwind" : "$products"
    }, {
        $match : {
              "products._id" : mongoose.Types.ObjectId(data[i].productId)
        }
    }, {
        $lookup: {
            from: "mats",
            localField: "products.matId",
            foreignField: "_id",
            as: "matData"
        }
    }, {
      "$unwind" : "$matData"
    }, {
        $lookup : {
            from : "arts",
            localField: "products.artId",
            foreignField: "_id",
            as: "artData" 
        }
    }, {
        "$unwind" : "$artData"
    }, {
        $lookup : {
            from : "frames",
            localField: "products.frameId",
            foreignField: "_id",
            as: "frameData" 
        }
    }, {
      "$unwind" : "$frameData"
    }
    ]).exec(function(errRes, succRes) {
      if(!errRes && succRes) {
        newArray.push(succRes[0]);
        getDetailData(++i, newArray, data, cb);
      } else {
        cb(errRes, null);
      }
    })
  } else {
    cb(null, newArray)
  }
}

/*
***********************************************************
 Function  :  Function to get compare Details for Addd to cart
 Dated     :  07-November-2017
***********************************************************
*/

exports.removeCompareIndex = function(req, res) {
  var data = JSON.parse(localStorage.getItem("compareArray"));
  var updateArray = [];
  for(var i=0 ;i <data.length ; i++) {
    var obj = {};
    if(i == req.body.index) {
      continue;
    } else {
      obj.cartId = data[i].cartId;
      obj.productId = data[i].productId;
      updateArray.push(obj);
    }
  }
  localStorage.setItem("compareArray", JSON.stringify(updateArray));
  if(updateArray.length) {
    getDetailData(0, [], updateArray, function(error, response) {
      if(!error && response) {
        var outputJSON = {};
        outputJSON.status = 200;
        outputJSON.message = "Successfully updated locastorage";
        outputJSON.compareData = response;
        res.status(200).send(outputJSON);
      } else {
        var outputJSON = {};
        outputJSON.status = 400;
        outputJSON.message = "No products in Compare";
        outputJSON.compareData = data;
        res.status(400).send(outputJSON);
      }
    })
  } else {
    var outputJSON = {};
    outputJSON.status = 400;
    outputJSON.message = "No products in Compare";
    outputJSON.compareData = data;
    res.status(400).send(outputJSON);
  }
}

/*
***********************************************************
 Function  :  Function to get compare Details for Addd to cart
 Dated     :  07-November-2017
***********************************************************
*/

exports.resetCompareCart = function(req, res) {
  if(JSON.parse(localStorage.getItem("compareArray"))) {
    localStorage.clear();
    var outputJSON = {};
    outputJSON.status = 200;
    outputJSON.message = "Successfully Reset locastorage";
    res.status(200).send(outputJSON);
  } else {
    localStorage.clear();
    var outputJSON = {};
    outputJSON.status = 200;
    outputJSON.message = "Successfully Reset locastorage";
    res.status(200).send(outputJSON);
  }
}

/*
***********************************************************
 Function  :  Function to get Cart Details for Mobiles
 Dated     :  24-October-2017
***********************************************************
*/



exports.getCartMob = function(req, res) {
  var searchQry = {};
  searchQry.userId = req.body.userId;
  searchQry.isTemp = false;
  cartModel.findOne(searchQry, function(error, cartData) {
    if (!error) {
      if(cartData) {
        var searchQuery = {};
        searchQuery._id = cartData._id;
        getCartData(req, res, searchQuery);
      } else {
          var outputJSON = {};
          outputJSON.status = 400;
          outputJSON.message = "No cart for user";
          outputJSON.cartData = cartData;
          res.status(400).send(outputJSON);
      }
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error in Cart Data";
      outputJSON.error = error;
      res.status(500).send(outputJSON);
    }
  });
}



/*
***********************************************************
 Function  :  Function to save art Details
 Dated     :  28-August-2017
***********************************************************
*/


exports.updateArt = function(req, res) {

  var fetchData = {};
  var searchQry = {};
  var searchQuery = {};
  var updateInfo = {};
  var artSizeCatagory = {};

  artSizeCatagory.artSize = req.body.artSize;
  artSizeCatagory.artSizeTypeId = req.body.artSizeType._id;
  artSizeCatagory.artPrice = req.body.artSizeType.frameCost;

  fetchData.artType = req.body.artType;
  fetchData.artSizeCatagory = {};
  fetchData.artSizeCatagory = artSizeCatagory;

  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) {
      var length = cbSuccess.products.length - 1;
      var prodId = cbSuccess.products[length]._id;
      artId = cbSuccess.products[length].artId;
      var itemPrice = req.body.artSizeType.frameCost;
      artModel.findOneAndUpdate({
        "_id": artId
      }, {
        $set: fetchData
      }, {
        new: true
      }).exec(function(err, artData) {
        if (!err) {
          if (artData) {
            cartModel.findOneAndUpdate({
              _id: cbSuccess._id,
              "products._id": prodId
            }, {
              $set: {
                "products.$.artId": artId,
                "products.$.itemPrice": req.body.artSizeType.frameCost
              }
            }, {
              new: true
            }, function(error, cartData) {
              if (!error) {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "Art Successfully Saved and Order Updated";
                outputJSON.artData = artData;
                outputJSON.cartData = cartData;
                res.status(200).send(outputJSON);
              } else {
                var outputJSON = {};
                outputJSON.status = 500;
                outputJSON.message = "Error in updating cart";
                outputJSON.artData = artData;
                outputJSON.error = err;
                res.status(500).send(outputJSON);
              }
            });
          } else {
            var outputJSON = {};
            outputJSON.status = 204;
            outputJSON.message = "No Art Data";
            res.status(204).send(outputJSON);
          }
        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Error in Art Data";
          outputJSON.error = err;
          res.status(500).send(outputJSON);
        }
      });
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Temp User having error";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}



/*
***********************************************************
 Function  :  list of Frame Size with their Costs
 Dated     :  29-August-2017
***********************************************************
*/



exports.getSizeCosts = function(req, res) {
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
 Function  :  list of Mat
 Dated     :  29-August-2017
***********************************************************
*/


exports.listMat = function(req, res) {
  matModel.find().exec(function(err, matData) {
    if (!err) {
      if (matData) {
        var outputJSON = {};
        outputJSON.status = 200;
        outputJSON.message = "Mats  Success";
        outputJSON.matData = matData;
        res.status(200).send(outputJSON);
      } else {
        var outputJSON = {};
        outputJSON.status = 204;
        outputJSON.message = "Mats not found";
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
}



/*
***********************************************************
 Function  :  Update the art Value after getting new Sizes
 Dated     :  30-August-2017
***********************************************************
*/



exports.newArt = function(req, res) {
  var fetchData = {};
  var searchQry = {};
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) {
      searchQry._id = cbSuccess._id;
      searchQry.products = {};
      fetchData.artSizes = req.body.art;
      var prodId = req.body.prodId;
      artModel(fetchData).save(function(err, artData) {
        if (!err) {
          if (artData) {
            var artID = artData._id;
            cartModel.update({
              _id: cbSuccess._id,
              "products._id": prodId
            }, {
              $set: {
                "products.$.artId": artID
              }
            }).exec(function(error, updatedData) {
              if (!error) {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "Art Successfully Saved and cart Updated";
                outputJSON.artData = artData;
                res.status(200).send(outputJSON);
              } else {
                var outputJSON = {};
                outputJSON.error = err;
                res.status(500).send(outputJSON);
              }
            });
          } else {
            var outputJSON = {};
            outputJSON.status = 304;
            outputJSON.message = "Art not found";
            res.status(304).send(outputJSON);
          }
        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Something Went Wrong";
          outputJSON.error = err;
          res.status(500).send(outputJSON);
        }
      });
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}


exports.newArtMobile = function(req, res) {
  var saveInfo = {};
  saveInfo.artSizeCatagory = {};
  var artSize = {};
  artSize.width = req.body.artWidth;
  artSize.height = req.body.artHeight;
  saveInfo.artSizeCatagory.artSize = artSize;


  artModel(saveInfo).save(function(err, artData) {
    if (!err) {
      var outputJSON = {};
      outputJSON.status = 200;
      outputJSON.message = "Art Successfully Saved and cart Updated";
      outputJSON.artData = artData;
      res.status(200).send(outputJSON);
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error in saving art";
      outputJSON.error = err;
      res.status(500).send(outputJSON);
    }
  });
}


/*
***********************************************************
 Function  :  list of ArtSizes
 Dated     :  30-August-2017
***********************************************************
*/



exports.artSizes = function(req, res) {
  var searchQry = {};
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) {
      var length = cbSuccess.products.length - 1;
      searchQry._id = cbSuccess.products[length].artId;
      artModel.find(searchQry).exec(function(err, artData) {
        if (!err) {
          if (artData) {
            var outputJSON = {};
            outputJSON.status = 200;
            outputJSON.message = "Art Data Success";
            outputJSON.artData = artData;
            res.status(200).send(outputJSON);
          } else {
            var outputJSON = {};
            outputJSON.status = 204;
            outputJSON.message = "Art not found";
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
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}



/*
***********************************************************
 Function  :  add to cart service
 Dated     :  30-August-2017
***********************************************************
*/



exports.addToCart = function(req, res) {
  var artData = {};
  var orderQry = {};
  var artQry = {};
  var matId = req.body.matColor;
  gettingMatPrice(matId, function(matErr, matSucc) {
    if (!matErr) {
      var matPrice = matSucc.matPrice;
      getTempUser(req, function(cbErr, cbSuccess) {
        if (!cbErr) {
          var length = cbSuccess.products.length - 1;
          artQry._id = cbSuccess.products[length].artId;
          artData.artSizeCatagory = {};
          artData.artSizeCatagory.artSize = req.body.artSize;
          artData.artSizeCatagory.artSizeTypeId = req.body.artSizeType._id;
          artModel.update(artQry, {$set: artData}, function(err, updtArt) {
            if (!err) {
              var prodId = cbSuccess.products[length]._id;
              var itemPrice = cbSuccess.products[length].itemPrice + matPrice;
              cartModel.findOneAndUpdate({_id: cbSuccess._id,"products._id": prodId}, {
                $set: {
                  "products.$.matId": req.body.matColor,
                  "products.$.itemPrice": itemPrice,
                  "products.$.inCart" : true
                }
              }, {new : true}).exec(function(error, cartData) {
                if (!error) {
                  if (cartData) {
                    var searchQuery = {};
                    searchQuery._id = cartData._id;
                    var productsId = [];
                    for(var j=0 ; j<cartData.products.length ; j++) {
                      if(!cartData.products[j].inCart) {
                        productsId.push(cartData.products[j]._id);
                      }
                      if(j+1 == cartData.products.length) {
                        if(productsId.length) {
                          updateNewCart(cartData, searchQuery, productsId, req, res);
                        } else {
                          if (req.session.user != undefined) {
                            var sections = {};
                            sections.checkoutLogin = false;
                            sections.accountDetails = true;
                            sections.payment = false;
                            sections.confirm = false;
                            req.session.checkout = sections;
                          } else {
                            var sections = {};
                            sections.checkoutLogin = true;
                            sections.accountDetails = false;
                            sections.payment = false;
                            sections.confirm = false;
                            req.session.checkout = sections;
                          }

                          var tempUser = {};
                          var outputJSON = {};
                          outputJSON.status = 200;
                          outputJSON.message = "Arts Updated and cart created";
                          outputJSON.cartData = cartData;
                          outputJSON.checkout = req.session.checkout;
                          res.status(200).send(outputJSON);
                        }
                      }
                    }
                    
                  } else {
                    var outputJSON = {};
                    outputJSON.status = 304;
                    outputJSON.message = "cart Data not found";
                    res.status(304).send(outputJSON);
                  }
                } else {
                  var outputJSON = {};
                  outputJSON.status = 500;
                  outputJSON.message = "Something Went Wrong in Updating cart";
                  outputJSON.error = newerror;
                  res.status(500).send(outputJSON);
                }
              }); 
            } else {
              var outputJSON = {};
              outputJSON.status = 500;
              outputJSON.message = "Something Went Wrong in arts";
              outputJSON.error = err;
              res.status(500).send(outputJSON);
            }
          });
        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Error while temp User";
          outputJSON.error = cbErr;
          res.status(500).send(outputJSON);
        }
      });
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Something Went in Mat function";
      outputJSON.error = matErr;
      res.status(500).send(outputJSON);
    }
  });
}




function updateNewCart(newCartData, searchQry, productsId, req, res) {
  cartModel.findOneAndUpdate(searchQry, {$pull: {products: {"inCart" : false}}}, {multi: true}).exec(function(cartErr, cartSucc) {
    if(!cartErr) {
      var totalPrice = 0;
      for (var i = 0; i < cartSucc.products.length; i++) {
        if(cartSucc.products[i].inCart) {
          totalPrice = totalPrice + (cartSucc.products[i].itemPrice * cartSucc.products[i].quantity);
        }
      }
      
      if (i == cartSucc.products.length) {
        var updateQry = {};
        updateQry.totalPrice = totalPrice - discountedPrice;
        cartModel.findOneAndUpdate({_id: cartSucc._id}, {$set: updateQry}).exec(function(newerror, newCartData) {
          if (!newerror) {
            if (newCartData) {
              if (req.session.user != undefined) {
                var sections = {};
                sections.checkoutLogin = false;
                sections.accountDetails = true;
                sections.payment = false;
                sections.confirm = false;
                req.session.checkout = sections;
              } else {
                var sections = {};
                sections.checkoutLogin = true;
                sections.accountDetails = false;
                sections.payment = false;
                sections.confirm = false;
                req.session.checkout = sections;
              }
             
              var tempUser = {};
              var outputJSON = {};
              outputJSON.status = 200;
              outputJSON.message = "Arts Updated and cart created";
              outputJSON.cartData = cartSucc;
              outputJSON.checkout = req.session.checkout;
              res.status(200).send(outputJSON);
            } else {
              var outputJSON = {};
              outputJSON.status = 304;
              outputJSON.message = "cart Data not found";
              outputJSON.cartData = newCartData;
              res.status(304).send(outputJSON);
            }
          } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Something Went Wrong in Updating cart";
          outputJSON.error = newerror;
          res.status(500).send(outputJSON);
        }
      });
    }   
  } else {
      var outputJSON = {};
      outputJSON.status = 400;
      outputJSON.message = "Errror in removing products";
      outputJSON.error = cartErr;
      res.status(400).send(outputJSON);
  }
  });
}



/*
***********************************************************
 Function  :  add to cart Mobile service
 Dated     :  14-October-2017
***********************************************************
*/


exports.addToCartMob = function(req, res) {
  var searchQry = {};
  var saveQry = {};
  var cartData = {};
  cartData = req.body;
  saveQry.products = req.body.products;
  saveMultiImages(0, saveQry.products, [], function(error, resSucc) {
    if (!error) {
      for (var j = 0; j < saveQry.products.length; j++) {
        cartData.products[j].productImage = resSucc[j];
        if (j + 1 == saveQry.products.length) {
          saveCart(req, res, cartData);
        }
      }
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error in Add to cart saving Product Image";
      outputJSON.error = error;
      res.status(500).send(outputJSON);
    }
  });
}


function saveCart(req, res, newCartData) {
  var searchQry = {};
  // newCartData.products[0].itemPrice = newCartData.products[0].itemPrice + newCartData.products[0].optionalExtra;
  // console.log("NewCartData Item Price is : ", newCartData.products[0].itemPrice);
  searchQry.userId = req.body.userId;
  searchQry.isTemp = false;
  var saveInfo = {};
  newCartData.isTemp = false;
  saveInfo.products = newCartData.products[0];
  cartModel.findOne(searchQry, function(resErr, resSucc) {
    if (!resErr) {
      if (resSucc) {
        var searchQuery = {};
        searchQuery._id = resSucc._id;
        cartModel.findOneAndUpdate(searchQuery, {$push: saveInfo}, {new: true}, function(err, cartData) {
          if (!err && cartData) {
            var totalPrice = 0;
            for (var i = 0; i < cartData.products.length; i++) {
              totalPrice = totalPrice + ((cartData.products[i].itemPrice + cartData.products[i].optionalExtra) * cartData.products[i].quantity) ;
            } 
            if(i == cartData.products.length) {
              var updateQry = {};
              updateQry.totalPrice = totalPrice;
  
              cartModel.findOneAndUpdate(searchQuery, {$set: updateQry}, {new: true}, function(error, cartsData) {
                if(!error) {
                  getCartData(req, res, searchQuery);
                } else {
                  var outputJSON = {};
                  outputJSON.status = 500;
                  outputJSON.message = "Error in Cart Data updating for the existing Values";
                  outputJSON.error = error;
                  res.status(500).send(outputJSON);
                }
              });
            }
          } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Error in Cart Data updating for the existing Values";
            outputJSON.error = err;
            res.status(500).send(outputJSON);
          }
        });
      } else {
        cartModel(newCartData).save(function(cartErr, cartsData) {
          if (!cartErr && cartsData) {
            var totalPrice = 0;
            for (var i = 0; i < cartsData.products.length; i++) {
              totalPrice = totalPrice + ((cartsData.products[i].itemPrice + cartsData.products[i].optionalExtra) * cartsData.products[i].quantity);
            } 
            if(i == cartsData.products.length) {
              var searchQuery = {};
              searchQuery._id = cartsData._id;
              var updateQry = {};
              updateQry.totalPrice = totalPrice;
              cartModel.findOneAndUpdate(searchQuery, {$set: updateQry}, {new: true}, function(error, cartData) {
                if(!error) {
                  getCartData(req, res, searchQuery);
                } else {
                  var outputJSON = {};
                  outputJSON.status = 500;s
                  outputJSON.message = "Error in Cart Data updating for the existing Values";
                  outputJSON.error = error;
                  res.status(500).send(outputJSON);
                }
              });
            }
          } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Error in saving new cart";
            outputJSON.error = cartErr;
            res.status(500).send(outputJSON);
          }
        });
        console.log("Error in saving new Cart");
      }
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error in finding  cart";
      outputJSON.error = resErr;
      res.status(500).send(outputJSON);
    }
  });
  console.log("Error in saving new Cart");
  
}



function getCartData(req, res, cartId) {
  var userId = req.body.userId;
  var id = cartId._id;
  var searchQry = {};
  searchQry._id = mongoose.Types.ObjectId(id);
  searchQry.userId = mongoose.Types.ObjectId(userId)
  searchQry.isTemp = false;
  cartModel.aggregate([{
    $match: searchQry
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
  //   "$unwind": "$matData"
  // }, {
  //   "$unwind": "$artData"
  // }, {
  //   "$unwind": "$frameData"
  // }, {
    $project: {
      _id: "$_id",
      createdOn: "$createdOn",
      isTemp: "$isTemp",
      totalPrice: "$totalPrice",
      products: {
        "matData": { $arrayElemAt: [ "$matData", 0 ] },
        "artData": { $arrayElemAt: [ "$artData", 0 ] },
        "frameInfo": { $arrayElemAt: [ "$frameData", 0 ] },
        "_id": "$products._id",
        "productImage": "$products.productImage",
        "itemPrice": "$products.itemPrice",
        "optionalExtra": "$products.optionalExtra",
        "imageSize": "$products.imageSize",
        "quantity": "$products.quantity",
        "type": "$products.type",
        "imageSizeCost": "$products.imageSizeCost",
        "frameAspectRatio": "$products.frameAspectRatio",
        "frameDimensions": "$products.frameDimensions",
        "isDigital": "$products.isDigital",
        "instruction": "$products.instruction"
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
  }]).exec(function(error, carts) {
    if (!error && carts) {
      var outputData = [];
      if(carts.length !=0 && carts[0].products.length != 0) {
          for (var k = 0; k < carts[0].products.length; k++) {
            var totalCost = 0;
            totalCost = ((carts[0].products[k].itemPrice + carts[0].products[k].optionalExtra) * carts[0].products[k].quantity);
            var products = {};
            products.cartId = carts[0]._id;
            products.productId = carts[0].products[k]._id;
            products.ownArtwork = carts[0].products[k].isDigital;
            products.image = req.protocol + "://" + req.headers.host + carts[0].products[k].productImage;
            products.matColor = carts[0].products[k].matData.color;
            products.matColorName = carts[0].products[k].matData.matColor;
            products.optionalExtra = carts[0].products[k].matData.matPrice;
            products.matId = carts[0].products[k].matData._id;
            products.artId = carts[0].products[k].artData._id;
            if(carts[0].products[k].artData.artSizeCatagory.artSize) {
              products.imageSize = carts[0].products[k].artData.artSizeCatagory.artSize;
            } else {
              products.imageSize = carts[0].products[k].artData.artSizeCatagory[0].artSize;
            }``
            products.itemPrice = carts[0].products[k].itemPrice;
            products.frameInfo = carts[0].products[k].frameInfo;
            products.frameSize = carts[0].products[k].imageSizeCost.frameSize;
            products.quantity = carts[0].products[k].quantity;
            products.frameDimensions = carts[0].products[k].frameDimensions;
            products.frameAspectRatio = carts[0].products[k].frameAspectRatio;
            products.totalcost = totalCost;
            products.type = carts[0].products[k].type;
            var specifications = [];
            var dimens = {};
            var specData = {};
            dimens.frameworkHeight = products.imageSize.height;
            dimens.frameworkWidth = products.imageSize.width;
            specData.frameDimens = dimens;
            specData.frameSize = products.frameSize;
            specData.itemPrice = products.itemPrice;
            specifications.push(specData);
            products.specifications = specifications;
            outputData.push(products);
          }
          var outputJSON = {};
          outputJSON.status = 200;
          outputJSON.message = "Cart Value Successfully";
          outputJSON.cartData = outputData;
          res.status(200).send(outputJSON);
      }
      else {
        var outputJSON = {};
        outputJSON.status = 304;
        outputJSON.message = "No Cart Product";
        outputJSON.cartData = carts;
        res.status(304).send(outputJSON);
      }
    } else {
      var outputJSON = {};
      outputJSON.status = 400;
      outputJSON.message = "Error in carts listing";
      outputJSON.error = error;
      res.status(400).send(outputJSON);
    }
  });
}





/*
***********************************************************
 Function  :  Getting Mat Price based on mat color id
 Dated     :  1-September-2017
 ***********************************************************
 */



exports.addToCartCompare = function(req, res) {
  var searchQry = {};
  var cartId = req.body.cartId;
  var prodId = req.body.productId;
  cartModel.update({_id: cartId,"products._id": prodId}, {$set: {"products.$.inCart": true}}).exec(function(err, succ) {
    if(!err && succ) {
      var searchQuery = {};
      searchQuery._id = cartId;
      cartModel.findOneAndUpdate(searchQuery, {$pull: {products: {"inCart" : false}}}, {multi: true}).exec(function(cartErr, cartSucc) {
        if(!cartErr && cartSucc) {
          localStorage.clear();
          if (req.session.user != undefined) {
            var sections = {};
            sections.checkoutLogin = false;
            sections.accountDetails = true;
            sections.payment = false;
            sections.confirm = false;
            req.session.checkout = sections;
          } else {
            var sections = {};
            sections.checkoutLogin = true;
            sections.accountDetails = false;
            sections.payment = false;
            sections.confirm = false;
            req.session.checkout = sections;
          }
    
          var tempUser = {};
          var outputJSON = {};
          outputJSON.status = 200;
          outputJSON.message = "Arts Updated and cart created";
          outputJSON.cartData = cartSucc;
          outputJSON.checkout = req.session.checkout;
          res.status(200).send(outputJSON);
        } else {
          var outputJSON = {};
          outputJSON.status = 400;
          outputJSON.message = "Errror in removing products";
          outputJSON.error = cartErr;
          res.status(400).send(outputJSON);
        }
       });
    } else {
      var outputJSON = {};
      outputJSON.status = 400;
      outputJSON.message = "Error in updating cart List";
      outputJSON.error = err;
      res.status(400).send(outputJSON);
    }
  });
}

/*
***********************************************************
 Function  :  Getting Mat Price based on mat color id
 Dated     :  1-September-2017
 ***********************************************************
 */



var gettingMatPrice = function(matId, cbMat) {
  var searchQry = {};
  searchQry._id = matId;
  matModel.findOne(searchQry, function(err, matData) {
    if (!err) {
      cbMat(null, matData);
    } else {
      cbMat(err, 'Error');
    }
  })
}



/*
***********************************************************
 Function  :  Getting Mat Cost bases of ID
 Dated     :  08-Sept-2017
***********************************************************
*/



exports.matDetails = function(req, res) {
  var searchQry = {};
  searchQry._id = req.body.matID;
  matModel.findOne(searchQry, function(err, matData) {
    if (!err) {
      if (matData) {
        var outputJSON = {};
        outputJSON.status = 200;
        outputJSON.message = "Mat Data Sucess";
        outputJSON.matData = matData;
        res.status(200).send(outputJSON);
      } else {
        var outputJSON = {};
        outputJSON.status = 204;
        outputJSON.message = "No Mat Data found";
        res.status(204).send(outputJSON);
      }
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "No Mat Data found";
      outputJSON.error = err;
      res.status(500).send(outputJSON);
    }
  });
}



/*
***********************************************************
 Function  :  Update cart for user id after login
 Dated     :  20-September-2017
***********************************************************
*/



exports.updateCartUserId = function(req, res) {
  var searchQry = {};
  if (req.session.user != undefined) {
    searchQry.userId = req.session.user._id;
    searchQry.isTemp = false;
  }
  if (req.session.guestUser != undefined && req.session.user == undefined) {
    searchQry.userId = req.session.guestUser._id;
    searchQry.isTemp = false;
  }
  
  // SearchQry for find cart for login user
  cartModel.findOne(searchQry, function(error, carts) {
    if(!error) { // Error in logged in user Cart 
      if(carts) { // Logged in user cart Successfull
        var searchQuery = {};
        searchQuery.tempUserId = req.cookies.qwertyuiop;
        searchQuery.isTemp = true;

        // searchQuery for temp cart which having recent products
        cartModel.findOne(searchQuery, function(errr, succCart) {
          if(!errr && succCart) {
            updateCartProduct(0, succCart, searchQry, function(erRes, sucRes) {
              if (!erRes) {
                cartModel.deleteOne(searchQuery, function(delErr, delSucc) {
                  if (!delErr) {
                    cartModel.findOne(searchQry, function(error, respo) {
                      if(!error) {
                        var updateInfo = {};
                        var total = 0;
                        for(var j=0 ; j<respo.products.length ; j++) {
                          total = total + respo.products[j].itemPrice;
                        }
                        total = total - discountedPrice;
                        updateInfo.totalPrice = total;

                        if(sucRes != "Products Updated") {
                          var searchQuery = {};
                          searchQuery.promoId = sucRes.promoId;
                          searchQuery.userId = req.session.user._id;
                          promoUsed.findOne(searchQuery, function(promoErr, promoSucc) {
                            if(!promoErr) {
                              if(promoSucc) {
                                cartModel.findOneAndUpdate(searchQry, {$set : updateInfo}, {new : true}).exec(function(errr, succc) {
                                  if(!errr && succc) {
                                    var outputJSON = {};
                                    outputJSON.status = 200;
                                    outputJSON.message = "New Cart updated for user";
                                    outputJSON.success = succc;
                                    outputJSON.promoSucc = false;
                                    res.status(200).send(outputJSON); 
                                  } else {
                                    var outputJSON = {};
                                    outputJSON.status = 400;
                                    outputJSON.message = "Error in Updating cart";
                                    outputJSON.error = errr;
                                    res.status(400).send(outputJSON);
                                  }
                                });
                              } else {
                                updateInfo.promoId = sucRes.promoId;
                                updateInfo.isPromo = true;
                                cartModel.findOneAndUpdate(searchQry, {$set : updateInfo}, {new : true}).exec(function(errr, succc) {
                                  if(!errr && succc) {
                                    var outputJSON = {};
                                    outputJSON.status = 200;
                                    outputJSON.message = "New Cart updated for user";
                                    outputJSON.success = succc;
                                    outputJSON.promoSucc = true;
                                    res.status(200).send(outputJSON); 
                                  } else {
                                    var outputJSON = {};
                                    outputJSON.status = 400;
                                    outputJSON.message = "Error in Updating cart";
                                    outputJSON.error = errr;
                                    res.status(400).send(outputJSON);
                                  }
                                }); 
                              }
                            } else {
                              var outputJSON = {};
                              outputJSON.status = 400;
                              outputJSON.message = "Error in finding used promo";
                              outputJSON.error = promoErr;
                              res.status(400).send(outputJSON);
                            }
                          });
                        } else {
                          cartModel.findOneAndUpdate(searchQry, {$set : updateInfo}).exec(function(errr, succc) {
                            if(!errr && succc) {
                              var outputJSON = {};
                              outputJSON.status = 200;
                              outputJSON.message = "New Cart updated for user";
                              outputJSON.success = succc;

                              res.status(200).send(outputJSON); 
                            } else {
                              var outputJSON = {};
                              outputJSON.status = 400;
                              outputJSON.message = "Error in Updating cart";
                              outputJSON.error = errr;
                              res.status(400).send(outputJSON);
                            }
                          }); 
                        }                
                      }
                    });
                  } else {
                    var outputJSON = {};
                    outputJSON.status = 500;
                    outputJSON.message = "Error in Deleting temp user from Cart";
                    outputJSON.error = delErr;
                    res.status(500).send(outputJSON);
                  }
                });
              } else {
                var outputJSON = {};
                outputJSON.status = 500;
                outputJSON.message = "Error in Updating user id in Cart";
                outputJSON.error = erRes;
                res.status(500).send(outputJSON);
              }
            });
          } else {
            var outputJSON = {};
            outputJSON.status = 400;
            outputJSON.message = "Error in Find cart";
            outputJSON.error = errr;
            res.status(400).send(outputJSON);
          }
        });
      } else {
        var searchQuery = {};
        searchQuery.tempUserId = req.cookies.qwertyuiop;
        searchQuery.isTemp = true;
        var updateQuery = {};
        if (req.session.user != undefined) {
          updateQuery.userId = req.session.user._id;
          updateQuery.isTemp = false;
          updateQuery.tempUserId = null;
        }
        if (req.session.guestUser != undefined && req.session.user == undefined) {
          updateQuery.userId = req.session.guestUser._id;
          updateQuery.isTemp = false;
          updateQuery.tempUserId = null;
        }
        
        cartModel.findOneAndUpdate(searchQuery, {$set : updateQuery}, {new : true}).exec(function(err, newCArt){
          if(!err) {
            var updateInfo = {};
            var total = 0;
            for(var k=0 ; k<newCArt.products.length ; k++) {
              total = total + newCArt.products[k].itemPrice;
            }
            total = total - discountedPrice;
            updateInfo.totalPrice = total;
            cartModel.findOneAndUpdate({"_id" : newCArt._id}, {$set : updateInfo}).exec(function(errr, succc) {
              if(!errr) {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "Successfully updated logged in user Cart with Price";
                outputJSON.success = succc;
                res.status(200).send(outputJSON);
              } else {
                var outputJSON = {};
                outputJSON.status = 400;
                outputJSON.message = "Error in Updating Cart price";
                outputJSON.error = errr;
                res.status(400).send(outputJSON);
              }
            });
          } else {
            var outputJSON = {};
            outputJSON.status = 400;
            outputJSON.message = "Error in Updating Cart Id";
            outputJSON.error = err;
            res.status(400).send(outputJSON);
          }
        });
      }
    } else {
      var outputJSON = {};
      outputJSON.status = 400;
      outputJSON.message = "Error while temp User";
      outputJSON.error = error;
      res.status(400).send(outputJSON);
    }
  });
}








var updateCartProduct = function(i, succCart, searchQry, callb) {
  if (i < succCart.products.length) {
    var updateInfo = {};
    
    updateInfo.products = succCart.products[i];
    cartModel.update(searchQry, {
      $push: updateInfo
    }, function(errUpdate, succUpdate) {
      if (!errUpdate) {
        updateCartProduct(++i, succCart, searchQry, callb);
      } else {
        callb(errUpdate, 'Error in Update products');
      }
    });
  } else {
    if(succCart.isPromo) {
      var promoInfo = {};
      promoInfo.promoId = succCart.promoId;
      callb(null, promoInfo);
    } else {
      callb(null, 'Products Updated');
    }
    
  }
}



/*
***********************************************************
 Function  :  Getting My Cart Values from cart table
 Dated     :  20-September-2017
***********************************************************
*/



exports.myCart   = function(req, res) {
  var searchQry = {};
    getTempUser(req, function(cbErr, cbSuccess) {
      if (!cbErr && cbSuccess) {
        if (req.session.user != undefined) {
          searchQry.userId = mongoose.Types.ObjectId(req.session.user._id);
          searchQry.isTemp = false;
        } else if (req.session.guestUser != undefined) {
          searchQry.userId = mongoose.Types.ObjectId(req.session.guestUser._id);
          searchQry.isTemp = false;
        } else {
          searchQry._id = mongoose.Types.ObjectId(cbSuccess._id);
          searchQry.isTemp = true;
        }        
        cartModel.aggregate([{
          $match: searchQry
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
            isGift : "$isGift",
            giftMessage : "$giftMessage",
            isPromo : "$isPromo",
            promoId : "$promoId", 
            userId : "$userId",
            isTemp: "$isTemp",
            totalPrice: "$totalPrice",
            products: {
              "matData": "$matData",
              "artData": "$artData",
              "mailinType": "$products.mailinType",
              "frameData": "$frameData",
              "_id": "$products._id",
              "productImage": "$products.productImage",
              "itemPrice": "$products.itemPrice",
              "imageSize": "$products.imageSize",
              "quantity": "$products.quantity",
              "artType": "$products.artType",
              "imageSizeCost": "$products.imageSizeCost",
              "instruction": "$products.instruction"
            }
          }
        }, {
          $group: {
            _id: "$_id",
            "createdOn": {
              "$first": "$createdOn"
            },
            "isGift": {
              "$first": "$isGift"
            },
            "isPromo": {
              "$first": "$isPromo"
            },
            "giftMessage": {
              "$first": "$giftMessage"
            },
            "promoId": {
              "$first": "$promoId"
            },
            "userId": {
              "$first": "$userId"
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
        }]).exec(function(err, cartData) {
          if (!err) {
            if (cartData) {
              if (req.session.user != undefined) {
                var sections = {};
                sections.checkoutLogin = false;
                sections.accountDetails = true;
                sections.payment = false;
                sections.confirm = false;
                req.session.checkout = sections;
              } else {
                var sections = {};
                sections.checkoutLogin = true;
                sections.accountDetails = false;
                sections.payment = false;
                sections.confirm = false;
                req.session.checkout = sections;
              }
              if(cbSuccess.isPromo) {
                var searchPromo = {};
                searchPromo._id = cbSuccess.promoId;
                promoModel.findOne(searchPromo, function( error, response) {
                  if(!error) {
                    var outputJSON = {};
                    outputJSON.status = 200;
                    outputJSON.message = "Cart Data Success";
                    outputJSON.cartData = cartData[0];
                    outputJSON.promoData = response;
                    outputJSON.sections = req.session.checkout;
                    res.status(200).send(outputJSON);
                  } else {
                    var outputJSON = {};
                    outputJSON.status = 400;
                    outputJSON.message = "Error in Promo Code Data";
                    outputJSON.error = error;
                    res.status(400).send(outputJSON);
                  }
                });
              } else {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "Cart Data Success";
                outputJSON.cartData = cartData[0];
                outputJSON.sections = req.session.checkout;
                res.status(200).send(outputJSON);
              }
              
            } else {
              var outputJSON = {};
              outputJSON.status = 304;
              outputJSON.message = "Cart not found";
              res.status(304).send(outputJSON);
            }
          } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Something Went Wrong";
            outputJSON.error = err;
            res.status(500).send(outputJSON);
          }
        });
      } else {
        var outputJSON = {};
        outputJSON.status = 500;
        outputJSON.message = "Error while temp User";
        outputJSON.error = cbErr;
        res.status(500).send(outputJSON);
      }
    });
}



/*
***********************************************************
 Function  :  Delete Products from Cart
 Dated     :  14-Sept-2017
***********************************************************
*/


exports.deleteProduct = function(req, res) {
  var productId = {};
  var updatedQry = {};
  productId._id = req.body.productId;

  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) {
      var cartId = {};
      cartId._id = cbSuccess._id;
      cartModel.update(cartId, {
        $pull: { products: productId }}, {multi: true}).exec(function(cartErr, cartSucc) {
        if (!cartErr) {
          cartModel.findOne(cartId, function(error, cartData) {
            if(!error && cartData) {
              var totalPrice = 0;
              for (var i = 0; i < cartData.products.length; i++) {
                if(cartData.products[i].inCart) {
                  totalPrice = totalPrice + (cartData.products[i].itemPrice * cartData.products[i].quantity);
                }
              }
              if (i == cartData.products.length) {
                updatedQry.totalPrice = totalPrice - discountedPrice;
                cartModel.findOneAndUpdate(cartId, {
                  $set: updatedQry
                }, function(errUp, updatedInfo) {
                  if (!errUp) {
                    var outputJSON = {};
                    outputJSON.status = 200;
                    outputJSON.message = "Cart Data Success";
                    outputJSON.updatedData = updatedInfo;
                    outputJSON.checkout = req.session.checkout;
                    res.status(200).send(outputJSON);
                  } else {
                    var outputJSON = {};
                    outputJSON.status = 500;
                    outputJSON.message = "Cart can't be updated now";
                    outputJSON.error = errUp;
                    res.status(500).send(outputJSON);
                  }
                });
              }
            } else {
              var outputJSON = {};
              outputJSON.status = 400;
              outputJSON.message = "Error in Finding cart";
              outputJSON.error = error;
              res.status(400).send(outputJSON);
            }
          })
        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Error while Deleting Cart Product";
          outputJSON.error = cartErr;
          res.status(500).send(outputJSON);
        }
      });
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}



/*
***********************************************************
 Function  :  Delete Products from Cart
 Dated     :  14-Sept-2017
***********************************************************
*/


exports.deleteProductMob = function(req, res) {
  var productId = {};
  var updatedQry = {};
  productId._id = req.body.productId;
  var searchQry = {};
  searchQry._id = req.body.cartId;
  searchQry.userId = req.body.userId;

  cartModel.update(searchQry, {$pull: {products: productId}}, {multi: true}).exec(function(cartErr, cartSucc) {
    if (!cartErr && cartSucc) {
      cartModel.findOne(searchQry, function(error, carts) {
        if (!error && carts) {
          var totalPrice = 0;
          for (var i = 0; i < carts.products.length; i++) {
            totalPrice = totalPrice + (carts.products[i].itemPrice * carts.products[i].quantity) + carts.products[i].optionalExtra;
          }
          if (i == carts.products.length) {
            updatedQry.totalPrice = totalPrice;
            cartModel.findOneAndUpdate(searchQry, {
              $set: updatedQry
            }, function(errUp, updatedInfo) {
              if (!errUp) {
                var searchFrame = {};
                searchFrame.userId = mongoose.Types.ObjectId(req.body.userId);
                searchFrame.isTemp = false;
                cartModel.aggregate([{
                  $match: searchFrame
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
                // }, {
                //   "$unwind": "$matData"
                // }, {
                //   "$unwind": "$artData"
                // }, {
                //   "$unwind": "$frameInfo"
                }, {
                  $project: {
                    _id: "$_id",
                    createdOn: "$createdOn",
                    isTemp: "$isTemp",
                    isGift: "$isGift",
                    giftMessage: "$giftMessage",
                    isPromo: "$isPromo",
                    totalPrice: "$totalPrice",
                    userId: "$userId",
                    products: {
                      "matData": { $arrayElemAt: [ "$matData", 0 ] },
                      "artData": { $arrayElemAt: [ "$artData", 0 ] },
                      "frameInfo": { $arrayElemAt: [ "$frameData", 0 ] },
                      "_id": "$products._id",
                      "frameDimensions": "$products.frameDimensions",
                      "frameAspectRatio": "$products.frameAspectRatio",
                      "createdOn": "$products.createdOn",
                      "isDigital": "$products.isDigital",
                      "quantity": "$products.quantity",
                      "itemPrice": "$products.itemPrice",
                      "type": "$products.type",
                      "imageSize": "$products.imageSize",
                      "productImage": "$products.productImage",
                      "matId": "$products.matId",
                      "artId": "$products.artId",
                      "imageSizeCost": "$products.imageSizeCost"
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
                    "isGift": {
                      "$first": "$isGift"
                    },
                    "giftMessage": {
                      "$first": "$giftMessage"
                    },
                    "totalPrice": {
                      "$first": "$totalPrice"
                    },
                    "isPromo": {
                      "$first": "$isPromo"
                    },
                    "userId": {
                      "$first": "$userId"
                    },
                    "products": {
                      "$push": "$products"
                    }
                  }
                }]).exec(function(cartErr, carts) {
                  if (!cartErr && carts) {
                    var outputData = [];
                    if(carts.length != 0) {
                        for (var k = 0; k < carts[0].products.length; k++) {
                          var products = {};
                          products.cartId = carts[0]._id;
                          products.productId = carts[0].products[k]._id;
                          products.ownArtwork = carts[0].products[k].isDigital;
                          products.image = req.protocol + "://" + req.headers.host + carts[0].products[k].productImage;
                          products.matColor = carts[0].products[k].matData.color;
                          products.matColorName = carts[0].products[k].matData.matColor;
                          products.optionalExtra = carts[0].products[k].matData.matPrice;
                          products.matId = carts[0].products[k].matData._id;
                          products.artId = carts[0].products[k].artData._id;
                          if (carts[0].products[k].artData.artSizeCatagory.artSize != undefined) {
                            products.imageSize = carts[0].products[k].artData.artSizeCatagory.artSize;
                          } else {
                            products.imageSize = carts[0].products[k].artData.artSizeCatagory[0].artSize;
                          }
                          products.type = carts[0].products[k].type;
                          products.itemPrice = carts[0].products[k].itemPrice;
                          products.frameInfo = carts[0].products[k].frameInfo;
                          products.frameSize = carts[0].products[k].imageSizeCost.frameSize;
                          products.quantity = carts[0].products[k].quantity;
                          products.frameDimensions = carts[0].products[k].frameDimensions;
                          products.frameAspectRatio = carts[0].products[k].frameAspectRatio;
                          products.totalcost = (carts[0].products[k].itemPrice + carts[0].products[k].matData.matPrice ) * carts[0].products[k].quantity;
                          var specifications = [];
                          var dimens = {};
                          var specData = {};
                          dimens.frameworkHeight = products.imageSize.height;
                          dimens.frameworkWidth = products.imageSize.width;
                          specData.frameDimens = dimens;
                          specData.frameSize = products.frameSize;
                          specData.itemPrice = products.itemPrice;
                          specifications.push(specData);
                          products.specifications = specifications;
                          outputData.push(products);
                        }
                        var outputJSON = {};
                        outputJSON.status = 200;
                        outputJSON.message = "Cart Data UPdate Success";
                        outputJSON.cartData = outputData;
                        res.status(200).send(outputJSON);
                      } else{
                        var outputJSON = {};
                        outputJSON.status = 200;
                        outputJSON.message = "Cart Data UPdate Success. No Product Available";
                        outputJSON.cartData = carts;
                        res.status(200).send(outputJSON);
                    }
                  } else {
                    var outputJSON = {};
                    outputJSON.status = 400;
                    outputJSON.message = "Cart can't be updated now";
                    outputJSON.error = cartErr;
                    res.status(400).send(outputJSON);
                  }
                });
              } else {
                var outputJSON = {};
                outputJSON.status = 400;
                outputJSON.message = "Cart can't be updated now";
                outputJSON.error = errUp;
                res.status(400).send(outputJSON);
              }
            });
          } else {
            var outputJSON = {};
            outputJSON.status = 304;
            outputJSON.message = "Cart is Empty";
            res.status(304).send(outputJSON);
          }
        } else {
          var outputJSON = {};
          outputJSON.status = 400;
          outputJSON.message = "Error while finding Cart Product";
          outputJSON.error = error;
          res.status(400).send(outputJSON);
        }
      });
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while Deleting Cart Product";
      outputJSON.error = cartErr;
      res.status(500).send(outputJSON);

    }
  });
}



/*
***********************************************************
 Function  :  Add Duplicate Product in Cart products
 Dated     :  14-Sept-2017
***********************************************************
*/


exports.makeDuplicateProduct = function(req, res) {
  var searchQry = {};
  var saveInfo = {};
  saveInfo.products = [];
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) {
      var cartId = {};
      cartId._id = cbSuccess._id;
      saveInfo.products = [];
      searchQry._id = req.body.productId;
      cartModel.aggregate([{
        $match: {
          "_id": mongoose.Types.ObjectId(cartId._id)
        }
      }, {
        "$unwind": "$products"
      }, {
        $match: {
          "products._id": mongoose.Types.ObjectId(searchQry._id)
        }
      }, {
        $project: {
          products: {
            "frameId": "$products.frameId",
            "artId": "$products.artId",
            "matId": "$products.matId",
            "productImage": "$products.productImage",
            "imageSize": "$products.imageSize",
            "itemPrice": "$products.itemPrice",
            "instruction": "$products.instruction"
          }
        }
      }]).exec(function(errCart, succCart) {
        if (!errCart) {
          saveInfo.products = succCart[0].products;
          cartModel.update(cartId, {
            $push: saveInfo
          }, function(errPush, dataPush) {
            if (!errPush) {
              var outputJSON = {};
              outputJSON.status = 200;
              outputJSON.message = "Cart Data Updated Successfully";
              outputJSON.success = dataPush;
              res.status(200).send(outputJSON);
            } else {
              var outputJSON = {};
              outputJSON.status = 500;
              outputJSON.message = "Cart Data can not updated";
              outputJSON.error = errPush;
              res.status(500).send(outputJSON);
            }
          });
        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Error while Deleting Cart Product";
          outputJSON.error = errCart;
          res.status(500).send(outputJSON);
        }
      });
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}



/*
***********************************************************
 Function  :  Add instruction to Product in Cart products
 Dated     :  14-Sept-2017
***********************************************************
*/


exports.addInstruction = function(req, res) {
  var prodId = req.body.productId;
  var instruction = req.body.instruction;
  var searchQry = {};


  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) {
      cartModel.update({
        _id: cbSuccess._id,
        "products._id": prodId
      }, {
        $set: {
          "products.$.instruction": instruction
        }
      }).exec(function(error, updatedCart) {
        if (!error) {
          var outputJSON = {};
          outputJSON.status = 200;
          outputJSON.message = "Cart Updated Successfully";
          outputJSON.updatedCart = updatedCart;
          res.status(200).send(outputJSON);
        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Error while temp User";
          outputJSON.error = error;
          res.status(500).send(outputJSON);
        }
      });
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}


/*
***********************************************************
 Function  :  Getting art Sizes based on Size ID
 Dated     :  31-August-2017
***********************************************************
*/


exports.getFrameSize = function(req, res) {
  var searchQry = {};
  var id = req.body._id;
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) {
      var length = cbSuccess.products.length - 1;
      searchQry._id = cbSuccess.products[length].artId;
      artModel.findOne(searchQry).exec(function(err, artData) {
        if (!err) {
          var artSize = artData.artSizeCatagory[0].artSize;
          var outputJSON = {};
          outputJSON.status = 200;
          outputJSON.message = "Art Size Data Success";
          outputJSON.artSize = artSize;
          res.status(200).send(outputJSON);
        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Something Went Wrong";
          outputJSON.error = err;
          res.status(500).send(outputJSON);
        }
      });
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  })
}



/*
***********************************************************
 Function  :  Check Out Services with create orders
 Dated     :  13-Sept-2017
***********************************************************
*/



exports.checkOut = function(req, res) {
  var searchQry = {};
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) {
      searchQry._id = cbSuccess._id;
      cartModel.findOne(searchQry).exec(function(err, cartData) {
        if (!err && cartData) {
          var orderData = {}; 
          orderData.isTemp = false;
          if (!req.session.user) {
            orderData.userId = req.session.guestUser._id;
          } else {
            orderData.userId = req.session.user._id;
          }
          var orderNum = parseFloat(randDig.generateDigits(10));
          orderData.totalPrice = cartData.totalPrice;
          orderData.products = cartData.products;
          orderData.promoId = cartData.promoId;
          orderData.isGift = cartData.isGift;
          orderData.isPromo  = cartData.isPromo;
          orderData.giftMessage = cartData.giftMessage;
          orderData.orderNumber = orderNum.toFixed(0);
          if(req.body.data != undefined && req.body.data.balance_transaction != undefined) {
            orderData.payment_method  = "stripe";
            orderData.transaction_id  = req.body.data.balance_transaction;
            orderData.payment_status  = req.body.data.status;
          } else {
            orderData.payment_method  = req.body.payer.payment_method;
            orderData.transaction_id  = req.body.id;
            orderData.payment_status  = req.body.state;
          }
         
          ordersModel(orderData).save(function(odErr, ordersData) {
            if (!odErr) {
              if (ordersData) {
                cartModel.deleteOne(searchQry, function(delErr, delSucc) {
                  if (!delErr) {
                    if(orderData.isPromo) {
                      var searchPromo = {};
                      searchPromo._id = cartData.promoId;
                      promoModel.findOne(searchPromo, function(promoError, promoSuccess) {
                        if(!promoError) {
                          if(promoSuccess.offerType == "Limited Offer") {
                            updatePromoCount(searchPromo);
                          }
                        } else {
                          var outputJSON = {};
                          outputJSON.status = 400;
                          outputJSON.message = "Something went wrong finding promo";
                          outputJSON.error = promoError;
                          res.status(400).send(outputJSON);
                        }
                      });
                      
                      var saveQry = {};
                      saveQry.userId = req.session.user._id;
                      saveQry.promoId = ordersData.promoId;
                      saveQry.isSuccess = true;
                      saveUserPromo(saveQry);
                    }                
                    promoModel.findOne(searchPromo, function(promoError, promoSuccess) {
                      if(!promoError) {
                        if(promoSuccess) {
                          confirmOrder(ordersData.userId, ordersData.totalPrice, res);
                          discountedPrice = 0;
                        } else {
                          var outputJSON = {};
                          outputJSON.status = 400;
                          outputJSON.message = "Something went wrong when updating Promo Model";
                          outputJSON.error = promoError;
                          res.status(400).send(outputJSON);
                        }
                      } else {
                        var outputJSON = {};
                        outputJSON.status = 400;
                        outputJSON.message = "Something went wrong when updating Promo Model";
                        outputJSON.error = promoError;
                        res.status(400).send(outputJSON);
                      }
                    });
                    var sections = {};
                    sections.checkoutLogin = false;
                    sections.accountDetails = false;
                    sections.payment = false;
                    sections.confirm = true;
                    req.session.checkout = sections;

                    var outputJSON = {};
                    outputJSON.status = 200;
                    outputJSON.message = "Cart Removed Successfully";
                    outputJSON.ordersData = ordersData;
                    outputJSON.sections = req.session.checkout;
                    req.session.checkout = {};
                    req.session.guestUser = undefined;
                    res.status(200).send(outputJSON); 
                  } else {
                    var outputJSON = {};
                    outputJSON.status = 400;
                    outputJSON.message = "Something went wrong when removing cart";
                    outputJSON.error = delErr;
                    res.status(400).send(outputJSON);
                  }
                });
              } else {
                var outputJSON = {};
                outputJSON.status = 204;
                outputJSON.message = "Order Data not get";
                res.status(204).send(outputJSON);
              }
            } else {
              var outputJSON = {};
              outputJSON.status = 400;
              outputJSON.message = "Order can not placed now";
              outputJSON.error = odErr;
              res.status(400).send(outputJSON);
            }
          });
      } else {
        var outputJSON = {};
        outputJSON.status = 400;
        outputJSON.message = "Error in CartData";
        outputJSON.error = err;
        res.status(400).send(outputJSON);
      }
    });
  } else {
        var outputJSON = {};
        outputJSON.status = 500;
        outputJSON.message = "Error while temp User";
        outputJSON.error = cbErr;
        res.status(500).send(outputJSON);
      }
  });
}



function confirmOrder(userId, totalPrice, res) {
  usersModel.findOne({"_id":userId}).exec(function(err,result){
    if(!err){
      emailTemplateModel.findOne({"templateCode": "order-confirmation"}).exec(function(error, response) {
        if (!error) {
          content_user = response.content;
          
          content_user = content_user.replace("{{ORDERNUMBER}}", result.orderNumber);
          content_user = content_user.replace("{{FRAMENAME}}", "Walnut frame");
          content_user = content_user.replace("{{MATCOLOR}}", "Dark Grey");
          content_user = content_user.replace("{{FRAMESIZE}}", "16.4 * 15.2");
          content_user = content_user.replace("{{TOTAL}}", (totalPrice));
          content_user = content_user.replace("{{SHIPPING}}", (result.shippingAddress?result.shippingAddress.address1:""));
          content_user = content_user.replace("{{BILLING}}", (result.billingAddress?result.billingAddress.address1:""));
                    
          var mailOptions = {
            from: 'surjitk@smartdatainc.net',
            to: result.email,
            subject: response.title,
            html: content_user
          };

          transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ');
            }
          });
        } else {
            console.log("The Email Template Model error is : ", error);
        }
      });
    } else {
      var outputJSON = {};
      outputJSON.status = 400;
      outputJSON.message = "Something went wrong finding User";
      outputJSON.error = err;
      res.status(400).send(outputJSON);
    }
  });
}

function updatePromoCount(searchPromo) {
  promoModel.update(searchPromo, { $inc: { offerCount: -1 } }).exec(function(error, response) {
    if(!error) {
      console.log("Response from updating Promo Doc offers Count : ");
    } else {
      console.log("Error from updating Promo Doc offers Count : ");
    }
  });
}


function saveUserPromo(saveQry) {
  promoUsed(saveQry).save(function(err, succ) {
    if(!err) {
      console.log("Success Promo for user");
    } else {
      console.log("Error in Promo save for user : ");
    }
  });
}
/*
***********************************************************
 Function  :  Get Check Out Date for Order
 Dated     :  23-Oct-2017
***********************************************************
*/


exports.getCheckOutDate = function(req, res) {
  checkOutModel.findOne().exec(function(err, eta) {
    if (!err && eta) {
      var outputJSON = {};
      outputJSON.status = 200;
      outputJSON.message = "Successfull ETA";
      outputJSON.etaData = eta;
      res.status(200).send(outputJSON);
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}



/*
***********************************************************
 Function  :  Check Out Services with create orders for Only Mobile
 Dated     :  06-Oct-2017
***********************************************************
*/



exports.checkOutMobile = function(req, res) {
  var searchQry = {};
  var saveInfo = {};

  // saveMultiImages(0, orderData.products, [], function(error, resSucc) {
  //   if (!error) {
  //     console.log("No Error in Image Upload , The new image path is : ", resSucc);
      // var products = [];
      // var saveInfo = {};
      // for (var i = 0; i < orderData.products.length; i++) {
      //   var productInfo = {};
      //   productInfo.productImage = req.body.cartData.products[i].productImage;
      //   productInfo.itemPrice = req.body.cartData.products[i].itemPrice;
      //   productInfo.matId = req.body.cartData.products[i].matId;
      //   productInfo.artId = req.body.cartData.products[i].artId;
      //   productInfo.frameId = req.body.cartData.products[i].frameId;
      //   productInfo.isPromo = req.body.cartData.products[i].isPromo;
      //   productInfo.promoId = req.body.cartData.products[i].promoId;  
      //   products.push(productInfo);
      // }
      saveInfo.products = req.body.cartData.products;
      saveInfo.totalPrice = req.body.cartData.totalPrice;
      saveInfo.userId = req.body.cartData.userId;
      var orderNum = parseFloat(randDig.generateDigits(10));
      saveInfo.orderNumber = orderNum;

      ordersModel(saveInfo).save(function(odErr, ordersData) {
        if (!odErr && ordersData) {
          var searchQuery = {};
          searchQuery.userId = mongoose.Types.ObjectId(ordersData.userId);
          searchQuery._id = mongoose.Types.ObjectId(ordersData._id);

          ordersModel.aggregate([{
            $match: searchQuery
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
              createdOn: "$createdOn",
              isTemp: "$isTemp",
              totalPrice: "$totalPrice",
              userData: "$userData",
              products: {
                "matData": "$matData",
                "artData": "$artData",
                "frameData": "$frameData",
                "_id": "$products._id",
                "productImage": "$products.productImage",
                "itemPrice": "$products.itemPrice",
                "isPromo" : "$products.isPromo",
                "promoId" : "$products.promoId",
                "imageSize": "$products.imageSize",
                "quantity": "$products.quantity",
                "imageSizeCost": "$products.imageSizeCost",
                "isDigital": "$products.isDigital",
                "instruction": "$products.instruction"
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
              "userData" : {
                "$first" : "$userData"
              },
              "products": {
                "$push": "$products"
              }
            }
          }]).exec(function(resErr, resSucc) {
            if (!resErr && resSucc) {
              var outputJSON = {};
              outputJSON.status = 200;
              outputJSON.message = "Order Successfully Placed";
              outputJSON.ordersData = resSucc[0]
              res.status(200).send(outputJSON);
            } else {
              console.log("Orders Data aggregation error.", resErr);
              var outputJSON = {};
              outputJSON.status = 500;
              outputJSON.message = "Orders Data aggregation error";
              outputJSON.error = resErr;
              res.status(500).send(outputJSON);
            }
          });
        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Order can not placed now";
          outputJSON.error = odErr;
          res.status(500).send(outputJSON);
        }
      });
  //   } else {
  //     console.log("Error in Image Upload for digital Photo", error);
  //     var outputJSON = {};
  //     outputJSON.status = 500;
  //     outputJSON.message = "Digital Photo not Added";
  //     outputJSON.error = error;
  //     res.status(500).send(outputJSON);
  //   }
  // });
}



var saveMultiImages = function(i, products, imagesPath, cb) {
  if (i < products.length) {
    var date = Date.now();
    var currentDate = date.valueOf();
    if (products.isDigital) {
      var imageName = 'DigitalImage';
    } else {
      var imageName = 'own-art';
    }
    var name = imageName + "-" + currentDate;
    var type = 'jpeg';
    var imageData = products[i].productImage;
    imageData = "data:" + type + ";base64," + imageData;

    


    decodeBase64Images(imageData, function(imgerr, imgres) {
      if (!imgerr) {
        var pathToStore = path.join(__dirname + './../../public/images/uploads/');
        var imageName = name + "." + type;
        var imagePath = "/images/uploads/" + imageName;
        //var imagePath = req.protocol + "://" + req.headers.host + "/uploads/" + imageName;
        fs.writeFile(pathToStore + imageName, imgres.data, function(err, img) {
          if (!err) {
            // console.log("The Image is : ", imagePath);
            imagesPath.push(imagePath);
            saveMultiImages(++i, products, imagesPath, cb)
          } else {
            cb(err, null);
          }
        });
      } else {
        cb(imgerr, null);
      }
    });
  } else {
    cb(null, imagesPath);
  }

}



/*
***********************************************************
 Function  :  Function to decode base64 Data into image
 Dated     :  24-August-2017
***********************************************************
*/


function decodeBase64Images(dataString, callbackData) {
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



exports.checkLogin = function(req, res) {
  var user = req.session.user;
  if (user) {
    var outputJSON = {};
    outputJSON.status = 200;
    outputJSON.message = "User Logged In";
    outputJSON.user = user;
    res.status(200).send(outputJSON);
  } else {
    var outputJSON = {};
    outputJSON.status = 500;
    outputJSON.message = "User Not Logged in";
    res.status(500).send(outputJSON);
  }
}








/*
***********************************************************
 Function  :  Payment Process for Order
 Dated     :  13-Sept-2017
***********************************************************
*/


exports.payment = function(req, res) {
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) {
      var searchQry = {};
      searchQry._id = cbSuccess._id;

      cartModel.findOne(searchQry).exec(function(err, succ) {
        if (!err) {
          var totalPrice = succ.totalPrice - discountedPrice;
          var priceCent = totalPrice * 100;
          var cardValue = {};
          cardValue.name = req.body.name;
          cardValue.number = parseInt(req.body.number);
          cardValue.exp_month = parseInt(req.body.exp_month.monthId);
          cardValue.exp_year = parseInt(req.body.exp_year);
          cardValue.cvc = parseInt(req.body.cvc);
          cardValue.address_country = 'Australia';
          if (!req.session.guestUser) {
            cardValue.address_line1 = req.session.user.billingAddress.address1;
            cardValue.address_city = req.session.user.billingAddress.city;
            cardValue.address_line2 = req.session.user.billingAddress.address2;
            cardValue.address_state = req.session.user.billingAddress.state;
            cardValue.address_zip = parseInt(req.session.user.billingAddress.zipCode);
          } else {
            cardValue.address_line1 = req.session.guestUser.billingAddress.address1;
            cardValue.address_city = req.session.guestUser.billingAddress.city;
            cardValue.address_line2 = req.session.guestUser.billingAddress.address2;
            cardValue.address_state = req.session.guestUser.billingAddress.state;
            cardValue.address_zip = parseInt(req.session.guestUser.billingAddress.zipCode);
          }
          stripeToken(cardValue, function(tokenErr, tokenRes) {
            if (!tokenErr) {
              var stripeToken = tokenRes.id;
              var amount = priceCent; //Taking payment in cents so multiply ammout with 100
              stripe.charges.create({
                  card: stripeToken,
                  currency: 'AUD',
                  amount: amount
                },
                function(err, charge) {
                  if (err) {
                    res.status(500).send(err);
                  } else {
                    res.status(200).send(charge);
                  }
                });
            } else {
              var outputJSON = {};
              outputJSON.status = 500;
              outputJSON.message = "Error Stripe Token";
              outputJSON.error = tokenErr;
              res.status(500).send(outputJSON);
            }
          })

        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Error while Getting Price Value";
          outputJSON.error = err;
          res.status(500).send(outputJSON);
        }
      });

    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}



var stripeToken = function(cardValue, stripeCB) {
  stripe.tokens.create({
    card: {
      name: cardValue.name,
      number: cardValue.number,
      exp_month: cardValue.exp_month,
      exp_year: cardValue.exp_year,
      cvc: cardValue.cvc,
      address_city: cardValue.address_city,
      address_country: cardValue.address_country,
      address_line1: cardValue.address_line1,
      address_line2: cardValue.address_line2,
      address_state: cardValue.address_state,
      address_zip: cardValue.address_zip
    }
  }, function(status, response) {
    if (!status) {
      stripeCB(null, response);
    } else {
      stripeCB(status, "Error in Stripe Token");
    }
  });
}



/*
***********************************************************
 Function  :  Payment Process in Mobile for Order
 Dated     :  09-Oct-2017
***********************************************************
*/


exports.paymentMobile = function(req, res) {
  var searchQry = {};
  var totalPrice = req.body.totalPrice;
  var stripeToken = req.body.stripeTokenId;
  var priceCent = totalPrice * 100;
  var amount = priceCent;
  stripe.charges.create({
      card: stripeToken,
      currency: 'AUD',
      amount: amount
    },
    function(err, charge) {
      if (!err) {
        var outputJSON = {};
        outputJSON.status = 200;
        outputJSON.message = "Payment success from Stripe.";
        outputJSON.paymentData = charge;
        res.status(200).send(outputJSON);
      } else {
        var outputJSON = {};
        outputJSON.status = 500;
        outputJSON.message = "Error Stripe Payment";
        outputJSON.error = err;
        res.status(500).send(outputJSON);
      }
    });
}



/*
***********************************************************
 Function  :  Payment Process in Mobile for Order
 Dated     :  09-Oct-2017
***********************************************************
*/



exports.getStripeTokenMobile = function(req, res) {

  var cardValue = {};
  var searchQry = {};
  searchQry._id = req.body.userId;
  usersModel.findOne(searchQry, function(error, userData) {
    if (!error) {
      cardValue.name = req.body.name;
      cardValue.number = parseInt(req.body.number);
      cardValue.exp_month = parseInt(req.body.exp_month);
      cardValue.exp_year = parseInt(req.body.exp_year);
      cardValue.cvc = parseInt(req.body.cvc);
      cardValue.address_country = 'Australia';

      cardValue.address_line1 = userData.billingAddress.address1;
      cardValue.address_city = userData.billingAddress.city;
      cardValue.address_line2 = userData.billingAddress.address2;
      cardValue.address_state = userData.billingAddress.state;
      cardValue.address_zip = parseInt(userData.billingAddress.zipCode);

      stripe.tokens.create({
        card: {
          name: cardValue.name,
          number: cardValue.number,
          exp_month: cardValue.exp_month,
          exp_year: cardValue.exp_year,
          cvc: cardValue.cvc,
          address_city: cardValue.address_city,
          address_country: cardValue.address_country,
          address_line1: cardValue.address_line1,
          address_line2: cardValue.address_line2,
          address_state: cardValue.address_state,
          address_zip: cardValue.address_zip
        }
      }, function(status, response) {
        if (!status) {
          var outputJSON = {};
          outputJSON.status = 200;
          outputJSON.message = "Token Generated for stripe Payment";
          outputJSON.stripeToken = response;
          res.status(200).send(outputJSON);
        } else {
          console.log("Payment Response having errror : ", status);
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Token Generation Error";
          outputJSON.error = status;
          res.status(500).send(outputJSON);
        }
      });
    } else {
      console.log("The Error is ", err);
    }
  });
}



//Paypal checkout pay

/**
 * React to pay POST. This will create paypal pay url and redirect user there.
 * @param {[type]} req [description]
 * @param {[type]} res) {} [description]
 * @return {[type]} [description]
 */

exports.pay = function(req, res) {
  var returnUrl = 'http://localhost:4099/paypal/success';
  var cancelUrl = 'http://localhost:4099/paypal/cancel';

  // create paypal object in sandbox mode. If you want non-sandbox remove tha last param.
  //var paypal = PayPal.create(process.env.API_USERNAME, process.env.API_PASSWORD, process.env.SIGNATURE, true);
  var payObject = paypal.create('surjitbaidwan-facilitator_api1.gmail.com',
    'DDSBHQEVSQVKHCCW', 'AFcWxV21C7fd0v3bYYYRCpSSRl31AI9eWdsd6bSBa3nY05f.90LuHNQR', true);
  payObject.setPayOptions('ACME Soft', null, process.env.logoImage, '00ff00', 'eeeeee');

  payObject.setProducts([{
    name: 'ACME Drill',
    description: 'Amazing drill',
    quantity: 1,
    amount: 10.99
  }]);

  // Invoice must be unique.
  var invoice = '12122';
  payObject.setExpressCheckoutPayment(
    'surjitbaidwan-buyer@gmail.com',
    invoice,
    10.99,
    'This is really amazing product you are getting',
    'USD',
    returnUrl,
    cancelUrl,
    false,
    function(err, data) { //console.log(err+'======'+JSON.stringify(data))
      if (err) {
        console.log(err);
        res.status(500).send(err);
        return;
      }
      // Regular paid.
      res.redirect(data.redirectUrl);
    });
}

exports.cancel = function(req, res) {
  app.get('/paypal/cancel', function(req, res) {
    // Cancel payment.
    res.send('Payment canceled');
  });
}

exports.success = function(req, res) {
  app.get('/paypal/success', function(req, res) {
    var paypal = PayPal.create('surjitbaidwan-facilitator_api1.gmail.com',
      'DDSBHQEVSQVKHCCW', 'AFcWxV21C7fd0v3bYYYRCpSSRl31AI9eWdsd6bSBa3nY05f.90LuHNQR', true);
    paypal.getExpressCheckoutDetails(req.query.token, true, function(err, data) {
      if (err) {
        res.status(500).send(err);
        return;
      }

      // Check token and details.
      var resObj = JSON.stringify(data);
      res.send('Successfuly payment, ' + resObj);
    });
  });
}



/*
***********************************************************
 Function  :  Get User Address
 Dated     :  13-Sept-2017
***********************************************************
*/



exports.getUserAddress = function(req, res) {
  try {
    usersModel.find({
      _id: req.body.id
    }, function(err, result) {
      if (err) {
        console.log(err)
      } else {
        var outputJSON = {};
        outputJSON.status = 200;
        outputJSON.message = "Successfully retrieved";
        outputJSON.userAddress = result;
        res.status(200).send(outputJSON);
      }
    })
  } catch (e) {
    res.status(400).send(e);
  }
}



/*
***********************************************************
 Function  :  Get All orders for a User
 Dated     :  13-Sept-2017
***********************************************************
*/



exports.myOrders = function(req, res) {
  if(req.session.user != undefined) {
    var id = req.session.user._id;
  }
  else {
    var id = req.body.userId;
  }
  ordersModel.aggregate([{
    $match: {
      "userId": mongoose.Types.ObjectId(id)
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
        "_id": "$products._id",
        "productImage": "$products.productImage",
        "isPromo" : "$products.isPromo",
        "promoId" : "$products.promoId",
        "itemPrice": "$products.itemPrice",
        "imageSize": "$products.imageSize",
        "instruction": "$products.instruction"
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
  }]).exec(function(errOrder, resOrder) {
    if (!errOrder) {
      if (resOrder) {
        var outputJSON = {};
        outputJSON.status = 200;
        outputJSON.message = "Successfully retrieved";
        outputJSON.orderData = resOrder;
        res.status(200).send(outputJSON);
      } else {
        var outputJSON = {};
        outputJSON.status = 304;
        outputJSON.message = "Order Data not get";
        res.status(304).send(outputJSON);
      }
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "User Not Get his Orders";
      outputJSON.error = errOrder;
      res.status(500).send(outputJSON);
    }
  });
}


/*
***********************************************************
 Function  :  Save user address
 Dated     :  13-October-2017
***********************************************************
*/

exports.saveAddress = function(req, res) {
  var searchQry = {};
  var updateQry = {};
  searchQry._id = req.session.user._id;
  updateQry.billingAddress = req.body.billing;
  updateQry.shippingAddress = req.body.shipping;
  usersModel.update(searchQry, {
    $set: updateQry
  }).exec(function(err, data) {
    if (!err) {
      var outputJSON = {};
      outputJSON.status = 200;
      outputJSON.message = "User addresss Updated";
      outputJSON.updateData = data;
      res.status(200).send(outputJSON);
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "User address is not updated";
      outputJSON.error = err;
      res.status(500).send(outputJSON);
    }
  });
}



/**********************************************/



exports.getUserAddress = function(req, res) {
  var searchQry = {};
  if (req.session.user == undefined) {
    searchQry._id = req.session.guestuser._id;
  } else {
    searchQry._id = req.session.user._id;
  }

  usersModel.findOne(searchQry, function(err, userData) {
    if (!err) {
      var outputJSON = {};
      outputJSON.status = 200;
      outputJSON.message = "Success in User Data";
      outputJSON.userData = userData;
      res.status(200).send(outputJSON);
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error in User Data";
      outputJSON.error = err;
      res.status(500).send(outputJSON);
    }
  })
}



exports.cartItem = function(req, res) {
  getTempUser(req, function(cbErr, cbSuccess) {
    if (cbSuccess) {
      var query = {};
      if (req.session.user) {
        query.userId = mongoose.Types.ObjectId(req.session.user._id);
        query.isTemp = false;
      } else {
        query._id = mongoose.Types.ObjectId(cbSuccess._id);
        query.isTemp = true;
      }
      cartModel.aggregate([{
        $match: query
      }, {
        $group: {
          _id: "$_id",
          total: {
            $sum: {
              $size: "$products"
            }
          }
        }
      }]).exec(function(err, cartItems) {
        // cartModel.findOne(searchQry).exec(function(err, cartItems) {
        if (!err) {
          var outputJSON = {};
          outputJSON.status = 200;
          outputJSON.message = "Success in Cart Items";
          outputJSON.cartItems = cartItems;
          res.status(200).send(outputJSON);
        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "UnSuccess in Cart Data";
          outputJSON.error = err;
          res.status(500).send(outputJSON);
        }
      })
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });

}



exports.updateAddress = function(req, res) {
  var searchQry = {};
  if (req.body.userId) {
    searchQry._id = req.body.userId;
  } else {
    searchQry._id = req.session.user._id;
  }
  var updateData = {};

  var billingData = {};
  billingData.firstName = req.body.Billing.firstName;
  billingData.lastName = req.body.Billing.lastName;
  billingData.address1 = req.body.Billing.address1;
  billingData.address2 = req.body.Billing.address2;
  billingData.city = req.body.Billing.city;
  billingData.state = req.body.Billing.state;
  billingData.zipCode = parseInt(req.body.Billing.zipCode);
  if (req.body.Shipping != undefined) {
    var shippingData = {};
    shippingData.firstName = req.body.Shipping.firstName;
    shippingData.lastName = req.body.Shipping.lastName;
    shippingData.address1 = req.body.Shipping.address1;
    shippingData.address2 = req.body.Shipping.address2;
    shippingData.city = req.body.Shipping.city;
    shippingData.state = req.body.Shipping.state;
    shippingData.zipCode = parseInt(req.body.Shipping.zipCode);
    updateData.shippingAddress = shippingData;
  }
  updateData.billingAddress = billingData;
  usersModel.update(searchQry, {$set: updateData}).exec(function(error, updated) {
    if (!error) {
      var sections = {};
      sections.checkoutLogin = false;
      sections.accountDetails = false;
      sections.payment = true;
      sections.confirm = false;
      req.session.checkout = sections;

      var outputJSON = {};
      outputJSON.status = 200;
      outputJSON.message = "Address Updated";
      outputJSON.success = updated;
      outputJSON.sections = req.session.checkout;
      res.status(200).send(outputJSON);
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = error;
      res.status(500).send(outputJSON);
    }
  })
}




exports.updateCartGift = function(req, res) {
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr && cbSuccess) {
      var searchQry = {};
      var updateQry = {};
      if(req.session.user != undefined) {
        searchQry.userId = req.session.user._id;
        searchQry._id = cbSuccess._id;
        searchQry.isTemp = false;
      } else {
        searchQry._id = cbSuccess._id;
        searchQry.isTemp = true;
      }
      if(req.body.giftMessage.length != 0) {
        updateQry.isGift = true;
        updateQry.giftMessage = req.body.giftMessage;
      } else {
        updateQry.isGift = false;
        updateQry.giftMessage = null;
      }
      cartModel.findOneAndUpdate(searchQry, { $set: updateQry }, function(errUp, updatedInfo) {
        if(!errUp) {
          var outputJSON = {};
          outputJSON.status = 200;
          outputJSON.message = "Error while temp User";
          outputJSON.error = updatedInfo;
        }
        else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Error in Update gift Message";
          outputJSON.error = cbErr;
        }
      });


      
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}



exports.updateProductQuantity = function(req, res) {
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) {
      if (cbSuccess) {
        updateProductPriceQuant(cbSuccess, 0, req, function(error, cbResp) {
          if (!error && cbResp) {
            var searchQry = {};
            searchQry._id = cbResp._id;
            var updatedQry = {};
            var totalPrice = 0;
            for (var i = 0; i < cbResp.products.length; i++) {
              if(cbResp.products[i].inCart) {
                totalPrice = totalPrice + (cbResp.products[i].itemPrice * cbResp.products[i].quantity);
              }
            }
            if (i == cbResp.products.length) {
              updatedQry.totalPrice = totalPrice - discountedPrice;
              cartModel.findOneAndUpdate(searchQry, {
                $set: updatedQry
              }, function(errUp, updatedInfo) {
                if (!error) {
                  if (req.session.user != undefined) {
                    var sections = {};
                    sections.checkoutLogin = false;
                    sections.accountDetails = true;
                    sections.payment = false;
                    sections.confirm = false;
                    req.session.checkout = sections;
                  } else {
                    var sections = {};
                    sections.checkoutLogin = true;
                    sections.accountDetails = false;
                    sections.payment = false;
                    sections.confirm = false;
                    req.session.checkout = sections;
                  }
                  var outputJSON = {};
                  outputJSON.status = 200;
                  outputJSON.message = "Cart Data Success";
                  outputJSON.updatedData = updatedInfo;
                  outputJSON.checkout = req.session.checkout;
                  res.status(200).send(outputJSON);
                } else {
                  var outputJSON = {};
                  outputJSON.status = 500;
                  outputJSON.message = "Cart can't be updated now";
                  outputJSON.error = errUp;
                  res.status(500).send(outputJSON);
                }
              });
            }
            // cartModel.update({_id: cbSuccess._id, "products._id": prodId}, { $set: {"products.$.frameId": frameData._id}}).exec(function(error, updatedCart) {
          } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Cart can't be updated now";
            outputJSON.error = error;
            res.status(500).send(outputJSON);
          }
        });
      } else {
        var outputJSON = {};
        outputJSON.status = 304;
        outputJSON.message = "Cart not found";
        res.status(304).send(outputJSON);
      }
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}


var updateProductPriceQuant = function(cbSuccess, i, req, cb) {
  var bodyData = req.body;
  if (i != bodyData.length) {
    var prodId = bodyData[i].id;
    var prodQuant = bodyData[i].quant;
    // var mailinType = bodyData[i].mailinType;
    cartModel.findOneAndUpdate({_id: cbSuccess._id,"products._id": prodId}, {$set: {"products.$.quantity": prodQuant}}).exec(function(err, updatedCart) {
      if (!err) {
        updateProductPriceQuant(cbSuccess, ++i, req, cb);
      } else {
        cb(err, null)
      }
    });
  } else {
    cartModel.findOne({
      _id: cbSuccess._id
    }, function(err, result) {
      if (!err) {
        cb(null, result)
      } else {
        cb(err, null)
      }
    })
  }
}

exports.updateMailinType = function(req, res) {
  try {
    var id = req.body.id;
    var mailinType = req.body.mailinType;
    getTempUser(req, function(cbErr, cbSuccess) {
      if (cbSuccess) {
        var cartId = cbSuccess._id;
        cartModel.update({
          "_id": cartId,
          "products._id": id
        }, {
          $set: {
            "products.$.mailinType": mailinType
          }
        }).exec(function(error, updatedInfo) {
          if (!error) {
            var outputJSON = {};
            outputJSON.status = 200;
            outputJSON.message = "Cart Data Success";
            outputJSON.updatedData = updatedInfo;
            outputJSON.checkout = req.session.checkout;
            res.status(200).send(outputJSON);
          } else {
            res.status(400).send(error);
          }
        })
      } else {
        var outputJSON = {};
        outputJSON.status = 500;
        outputJSON.message = "No Temp User";
        outputJSON.error = cbErr;
        res.status(500).send(outputJSON);
      }

    })
  } catch (e) {
    res.status(400).send(e);
  }

}





exports.updateCartPrice = function(req, res) {
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr) { 
      if (cbSuccess) {
        var searchQry = {};
        searchQry._id = cbSuccess._id;
        var updatedQry = {};
        var totalPrice = 0;
        for (var i = 0; i < cbSuccess.products.length; i++) {
          totalPrice = totalPrice + (cbSuccess.products[i].itemPrice * cbSuccess.products[i].quantity);
        }

        if(cbSuccess.isPromo) {
          promoModel.findOne({"_id" : cbSuccess.promoId}, function(error, success) {
            if(!error) {
              discountedPrice = success.discount;
              updatedQry.totalPrice = totalPrice - discountedPrice;
            }
          });
        } else {
          updatedQry.totalPrice = totalPrice;  
        }
        
        cartModel.update(searchQry, {$set: updatedQry}, function(errUp, updatedInfo) {
          if (!errUp) {
            if (req.session.user != undefined) {
              var sections = {};
              sections.checkoutLogin = false;
              sections.accountDetails = true;
              sections.payment = false;
              sections.confirm = false;
              req.session.checkout = sections;
            } else {
              var sections = {};
              sections.checkoutLogin = true;
              sections.accountDetails = false;
              sections.payment = false;
              sections.confirm = false;
              req.session.checkout = sections;
            }
            var outputJSON = {};
            outputJSON.status = 200;
            outputJSON.message = "Cart Data Success";
            outputJSON.updatedData = updatedInfo;
            outputJSON.checkout = req.session.checkout;
            res.status(200).send(outputJSON);
          } else {
            var outputJSON = {};
            outputJSON.status = 500;
            outputJSON.message = "Cart can't be updated now";
            outputJSON.error = errUp;
            res.status(500).send(outputJSON);
          }
        });
      } else {
        var outputJSON = {};
        outputJSON.status = 304;
        outputJSON.message = "Cart not found";
        res.status(304).send(outputJSON);
      }
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Error while temp User";
      outputJSON.error = cbErr;
      res.status(500).send(outputJSON);
    }
  });
}




/*
***********************************************************
 Function  :  Get varified on Promo Code for mobile API
 Dated     :  08-Nov-2017
***********************************************************
*/



exports.promoCode= function(req, res) {
    var searchQry = {};
    searchQry.promoCode = req.body.promoCode.toLowerCase();;
    searchQry.isDeleted = false;
    promoModel.findOne(searchQry, function(error, response) {
      if (!error && response) {
        if (response.offerType == "Date Range Offer") {
          var nowDate = new Date();
          if (Date.parse(nowDate) >= Date.parse(response.startDate) && Date.parse(nowDate) <= Date.parse(response.endDate)) {
            var searchPromo = {};
            searchPromo.promoId = response._id;
            if(req.session.user != undefined) {
              searchPromo.userId = req.session.user._id;
            } else if(req.session.guestUser != undefined && req.session.user == undefined) {
              searchPromo.userId = req.session.guestUser._id;
            }
            
            promoUsed.findOne(searchPromo, function(error, success) {
              if(!error) {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "Promo code is valid";
                outputJSON.promoData = response;
                res.status(200).send(outputJSON);
              } else {
                var outputJSON = {};
                outputJSON.status = 400;
                outputJSON.message = "This Promo code is Expired";
                outputJSON.error = error;
                res.status(400).send(outputJSON);
              }
            });
          } else {
            var outputJSON = {};
            outputJSON.status = 400;
            outputJSON.message = "This Promo code is Expired";
            res.status(400).send(outputJSON);
          }
        } else {
          if (response.usersCount != 0 && response.offerCount > 0) {
            var outputData = {};
            outputData.status = 200;
            outputData.message = "Promo code is valid";
            outputData.promoData = response;
            res.status(200).send(outputData);
          } else {
            var outputJSON = {};
            outputJSON.status = 400;
            outputJSON.message = "This Promo code is Expired";
            res.status(400).send(outputJSON);
          }
        }
      } else {
        var outputJSON = {};
        outputJSON.status = 500;
        outputJSON.message = "Invalid Promo code or having Error";
        outputJSON.error = error;
        res.status(500).send(outputJSON);
      }
    });
  }


/*
***********************************************************
 Function  :  Add Promo Code to the Product
 Dated     :  06-Oct-2017
***********************************************************
*/

exports.applyPromoCode = function(req, res) {
  var searchQry = {};
  var promocode = req.body.promoCode;
  promocode = promocode.toLowerCase();
  searchQry.promoCode = promocode;
  searchQry.isDeleted = false;
  promoModel.findOne(searchQry, function(error, response) {
    if (!error && response) {
      if (response.offerType == "Date Range Offer") {
        var nowDate = new Date();
        if (Date.parse(nowDate) >= Date.parse(response.startDate) && Date.parse(nowDate) <= Date.parse(response.endDate)) {
          if(req.session.user != undefined) {
            var searchQry = {};
            searchQry.promoId = response._id;
            searchQry.userId = req.session.user._id;
            promoUsed.findOne(searchQry, function(promoErr, promoSucc) {
              if(!promoErr) {
                if(promoSucc) {
                  var outputJSON = {};
                  outputJSON.status = 304;
                  outputJSON.message = "Promo code for the same user already applied";
                  outputJSON.promoData = promoSucc;
                  res.status(400).send(outputJSON);
                } else {
                  discountedPrice = response.discount;
                  addPromoToUser(req, res, response, function(errPromo, succPromo) {
                    if (!errPromo) {
                      var outputJSON = {};
                      outputJSON.status = 200;
                      outputJSON.message = "Promo Successfully Added";
                      outputJSON.promoData = succPromo;
                      res.status(200).send(outputJSON);
                    } else {
                      var outputJSON = {};
                      outputJSON.status = 500;
                      outputJSON.message = "Invalid Promo code or having Error";
                      outputJSON.error = error;
                      res.status(500).send(outputJSON);
                    }
                  });
                }
              } else {
                var outputJSON = {};
                outputJSON.status = 500;
                outputJSON.message = "Error in finding user promo used";
                outputJSON.error = promoErr;
                res.status(500).send(outputJSON);
              }
            });
          } else {
            discountedPrice = response.discount;
            addPromoToUser(req, res, response, function(errPromo, succPromo) {
              if (!errPromo) {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "Promo Successfully Added";
                outputJSON.promoData = succPromo;
                res.status(200).send(outputJSON);
              } else {
                var outputJSON = {};
                outputJSON.status = 500;
                outputJSON.message = "Invalid Promo code or having Error";
                outputJSON.error = error;
                res.status(500).send(outputJSON);
              }
            });
          }
        } else {
          var outputJSON = {};
          outputJSON.status = 304;
          outputJSON.message = "This Promo code is Expired";
          res.status(304).send(outputJSON);
        }
      } else {
        if (response.usersCount != 0 && response.offerCount > 0) {
          if(req.session.user != undefined) {
            var searchQry = {};
            searchQry.promoId = response._id;
            searchQry.userId = req.session.user._id;
            promoUsed.findOne(searchQry, function(promoErr, promoSucc) {
              if(!promoErr) {
                if(promoSucc) {
                  var outputJSON = {};
                  outputJSON.status = 304;
                  outputJSON.message = "Promo code for the same user already applied";
                  outputJSON.promoData = promoSucc;
                  res.status(400).send(outputJSON);
                } else {
                  discountedPrice = response.discount;
                  addPromoToUser(req, res, response, function(errPromo, succPromo) {
                    if (!errPromo) {
                      var outputJSON = {};
                      outputJSON.status = 200;
                      outputJSON.message = "Promo Successfully Added";
                      outputJSON.promoData = succPromo;
                      res.status(200).send(outputJSON);
                    } else {
                      var outputJSON = {};
                      outputJSON.status = 500;
                      outputJSON.message = "Invalid Promo code or having Error";
                      outputJSON.error = error;
                      res.status(500).send(outputJSON);
                    }
                  });
                }
              } else {
                var outputJSON = {};
                outputJSON.status = 500;
                outputJSON.message = "Error in finding user promo used";
                outputJSON.error = promoErr;
                res.status(500).send(outputJSON);
              }
            });
          } else {
            discountedPrice = response.discount;
            addPromoToUser(req, res, response, function(errPromo, succPromo) {
              if (!errPromo) {
                var outputJSON = {};
                outputJSON.status = 200;
                outputJSON.message = "Promo Successfully Added to temp User";
                outputJSON.promoData = succPromo;
                res.status(200).send(outputJSON);
              } else {
                var outputJSON = {};
                outputJSON.status = 500;
                outputJSON.message = "Invalid Promo code or having Error";
                outputJSON.error = error;
                res.status(500).send(outputJSON);
              }
            });
          }
        } else {
          var outputJSON = {};
          outputJSON.status = 304;
          outputJSON.message = "This Promo code is Expired";
          res.status(304).send(outputJSON);
        }
      }
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Invalid Promo code or having Error";
      outputJSON.error = error;
      res.status(500).send(outputJSON);
    }
  });
}



var addPromoToUser = function(req, res, PromoData, cb) {
  getTempUser(req, function(cbErr, cbSuccess) {
    if (!cbErr && cbSuccess) {
      var searchQry = {};
      var price = cbSuccess.totalPrice;
      searchQry._id = cbSuccess._id;
      var updatedQry = {};
      updatedQry.isPromo = true;
      updatedQry.promoId = PromoData._id;
      updatedQry.totalPrice = price - PromoData.discount;
      cartModel.findOneAndUpdate(searchQry, {$set: updatedQry}, {new : true}).exec(function(err, updateSucc) {
        if (!err) {
          cb(null, updateSucc);
        } else {
          cb(err, null);
        }
      }); //Cartmodel update for Promo END
    } else {
      cb(cbErr, null);
    }
  }); // Ennd Of Get Temp User
}



// Get Art Size API based on ID

exports.getImageSize = function(req, res) {
  artModel.findOne({
    "_id": req.body.artId
  }, function(err, resp) {
    if (!err) {
      var searchQry = {};
      searchQry._id = resp.artSizeCatagory[0].artSizeTypeId;
      sizeCostModel.findOne(searchQry, function(error, response) {
        if (!error) {
          var frameSize = response.frameSize;
          var frameCost = response.frameCost;
          cartModel.update({
            "_id": req.body.cartId,
            "products._id": req.body.prodId
          }, {
            $set: {
              "products.$.imageSizeCost.frameCost": frameCost,
              "products.$.imageSizeCost.frameSize": frameSize
            }
          }).exec(function(errorupdate, successUpdate) {
            if (!errorupdate) {
              var outputJSON = {};
              outputJSON.status = 200;
              outputJSON.message = "Art Data Success";
              outputJSON.sizeCostData = response;
              res.status(200).send(outputJSON);
            } else {
              var outputJSON = {};
              outputJSON.status = 500;
              outputJSON.message = "Error in update size n cost";
              outputJSON.error = errorupdate;
              res.status(500).send(outputJSON);
            }
          });
        } else {
          var outputJSON = {};
          outputJSON.status = 500;
          outputJSON.message = "Error in size n cost";
          outputJSON.error = error;
          res.status(500).send(outputJSON);
        }
      });
    } else {
      var outputJSON = {};
      outputJSON.status = 500;
      outputJSON.message = "Art Data not Success";
      outputJSON.error = err;
      res.status(500).send(outputJSON);
    }
  })
}



exports.getInspirationalImages = function(req, res) {
  inspirationObj.find().exec(function(err, response) {
    if (!err) {
      res.status(200).send(response);
    } else {
      res.status(400).send(err);
    }
  })
}

exports.getMetaTags = function(req, res) {
  seoObj.findOne().exec(function(err, response) {
    if (!err) {
      res.status(200).send(response);
    } else {
      res.status(400).send(err);
    }
  })
}

exports.getMetaData = function(req, res) {
  var data = req.body;
  if (data.stateTosend == "frames") {
    seoObj.findOne({
      "type": "Frames"
    }).exec(function(err, response) {
      if (!err) {
        res.status(200).send(response);
      } else {
        res.status(400).send(err);
      }
    })
  } else if (data.stateTosend == "pages") {
    var templateCode = data.param;
    pagesModel.findOne({
      "templateCode": templateCode
    }).exec(function(error, success) {
      if (!error) {
        res.status(200).send(success);
      } else {
        res.status(400).send(err);
      }
    })
  } else {
    seoObj.findOne({
      "type": "General"
    }).exec(function(err, response) {
      if (!err) {
        res.status(200).send(response);
      } else {
        res.status(400).send(err);
      }
    })
  }
}
