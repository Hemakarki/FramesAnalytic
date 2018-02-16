require('dotenv').config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var session = require('express-session');
var cors = require('cors');
var passport = require('passport');
var multer = require('multer');
var json2xls = require('json2xls');
var upload = multer({ dest: 'uploads/' });
var authentication = require('./apps/config/passport.js');
var passport = require('passport');
var stripe = require('stripe')('sk_test_GxXdLb24s9fCIgyKLCoZmaIA');


var db = require('./apps/config/db');
require('./apps/config/passport');
var index = require('./routes/index');
var app = express();

app.use(cors());
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compression());


app.use(bodyParser.urlencoded({

    extended: true
}));

app.use(bodyParser.json({limit: '100mb'}));
// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/', 'favicon.ico')));
app.use(logger('dev'));
app.use(json2xls.middleware);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/views')));
app.use(cors());

app.use(passport.initialize());
app.use(passport.session());

app.use(session({
	secret: 'keyboard-cat',
	cookie: {
		maxAge: 26280000000000
	},
	proxy: true,
	resave: true,
	saveUninitialized: true
}));


/*app.use(function (req, res, next) {
  var cookie = req.cookies.cookieName;
  if (cookie === undefined)
  {
    var randomNumber=Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
		res.cookie("tempUser",{"tempUserId" : randomNumber}, { maxAge: 900000, httpOnly: true });
    console.log('cookie created successfully');
  }
  else
  {
    console.log('cookie exists', cookie);
  }
  next();
});*/

app.use('/', index);
// app.use('/users', users);
require('./apps/config/passport.js')(app, express, passport);
require('./routes/admin')(app, express,multer);
require('./routes/authentication')(app, express,passport);
require('./routes/users')(app, express);
require('./routes/pages')(app,express);
require('./routes/checkout')(app, express);
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log("err>>>",err);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
