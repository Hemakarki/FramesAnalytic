
module.exports = function(app, express, passport) {
  var userModel = require('./../model/users.js');
  var LocalStrategy = require('passport-local').Strategy;
  passport.authenticate('LocalStrategy', {
    session: true
  })
  passport.use('localuser', new LocalStrategy({usernameField: 'email',},
    function(username, password, done) {
      userModel.findOne({email : username}).exec(function (err, user) {

      if (err) { return done(err); }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          message: 'User not found'
        });
      }
      // Return if password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Password is wrong'
        });
      }
      // If credentials are correct, return the user object
      return done(null, user);
    });
  }));

  
  passport.use('localadmin', new LocalStrategy(
    function(username, password, done) {
      userModel.findOne({email : username}).exec(function (err, user) {

      if (err) { return done(err); }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          message: 'User not found'
        });
      }
      // Return if password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Password is wrong'
        });
      }
      // If credentials are correct, return the user object
      return done(null, user);
    });
  }));
  /*passport.serializeUser(adminLoginObj.serializeUser);
  passport.deserializeUser(adminLoginObj.deserializeUser);*/

  passport.serializeUser(function(adminLoginObj, done) {
    done(null, adminLoginObj);
  });

  passport.deserializeUser(function(adminLoginObj, done) {
    done(null, adminLoginObj);
  });
}
