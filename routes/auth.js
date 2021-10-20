var express = require('express');
var router = express.Router();
var passport = require('passport');
var dotenv = require('dotenv');
var util = require('util');
var url = require('url');
var querystring = require('querystring');

dotenv.config();

// Perform the login, after login Auth0 will redirect to callback
router.get('/login', passport.authenticate('auth0', {
  scope: 'openid email profile'
}), function (req, res) {
  res.redirect('/');
});

const Login = require('../models/login');
const User = require('../models/user');
const async = require('async');
const ObjectId = require('mongodb').ObjectId;
var dbgUserList = require('debug')('userList');
/* Perform the final stage of authentication. If user exists in internal login
table, redirect to previously requested URL or note list at '/1/1/1'.
Otherwise return to login page */
router.get('/callback', function (req, res, next) {
  var found = false;
  passport.authenticate('auth0', function (err, user, info) {
    if (err) { return next(err); }
    if (!user) {
      return res.redirect('/login');
    } else {
      const { _raw, _json, ...userProfile } = user;
      var _userid = null;
      async.series({
        // Get list of users from logins table
        loginList: async function(callback) {
            loginList = await Login.find({}, '_username _user', callback);
            var breakException = {};
            try {
              loginList.forEach(function (loginItem, index) {
                dbgUserList('check ' + userProfile.nickname + ' against ' + loginItem._username);
                if (userProfile.nickname == loginItem._username) {
                  found = true;
                  _userid = loginItem._user;
                  throw breakException;
                }
              });
            } catch(e) {
              if (e !== breakException) throw e;
            }
            dbgUserList('loginList', loginList);
            if (!found) return 1;
        },
        // Get corresponding user from users table
        userList: async function(callback) {
          theUser = await User.findById(ObjectId(_userid), '_username _firstname _lastname', callback);
          if (!theUser) {
            if (!found) return 1;
          }
          theUser._imageUrl = userProfile.picture;
          dbgUserList('user', theUser);
        }
    }, function(err, results) {
        if (err) {
            console.error('Error processing user list: ' + err);
            return next(err);
        }
        req.logIn(user, function (err) {
          if (err) { return next(err); }
          if (!found) {
            // user not found in internal user table - logout
            res.redirect('/logout');
          } else {
            const returnTo = req.session.returnTo;
            delete req.session.returnTo;
            res.redirect(returnTo || '/1/1/1');
          }
        });
      });
    }
  })(req, res, next);
});
// Perform session logout and redirect to homepage
router.get('/logout', (req, res) => {
    req.logout();
  
    var returnTo = req.protocol + '://' + req.hostname;
    var port = req.connection.localPort;
    // Only add port in dev
    if (process.env.NODE_ENV === 'development' && (port !== undefined && port !== 80 && port !== 443)) {
      returnTo += ':' + port;
    }
    var logoutURL = new url.URL(
      util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN)
    );
    var searchString = querystring.stringify({
      client_id: process.env.AUTH0_CLIENT_ID,
      returnTo: returnTo
    });
    logoutURL.search = searchString;
  
    res.redirect(logoutURL);
  });
  
  module.exports = router;