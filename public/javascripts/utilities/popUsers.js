#! /usr/bin/env node

var mongoDB = 'mongodb+srv://Admin:M4rmoset52@cluster0.j8m3g.mongodb.net/NotesApp?retryWrites=true&w=majority';
const ObjectId = require('mongodb').ObjectId;
var async = require('async')
var User = require('../../../models/user')
var Login = require('../../../models/login')
var Membership = require('../../../models/membership')
var Account = require('../../../models/account')

var mongoose = require('mongoose');
console.log('connect to ' + mongoDB);
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
console.log('connected');
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var users = []
var logins = []
var memberships = []
var accounts = []

function userCreate(firstname, lastname, username, email, imageUrl, cb) {
  userdetail = {
    _firstname: firstname,
    _lastname: lastname,
    _username: username,
    _email: email,
    _imageUrl: imageUrl
    }
    
  var user = new User(userdetail);    
  user.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New User:', user);
    users.push(user)
    cb(null, user)
  }  );
}

function createUsers(cb) {
  async.parallel([
    function(callback) { userCreate("Selina", "Godden", "selina.godden", "sjgodden@googlemail.com", "", callback); },
    function(callback) { userCreate("Marjorie", "Godden", "marjorie.godden", "mjgodden5@gmail.com", "", callback); },  ],
  cb);
}

function loginCreate(username, user, cb) {
  logindetail = {
    _username: username,
    _user: user
    }
    
  var login = new Login(logindetail);    
  login.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Login:', login);
    logins.push(login)
    cb(null, login)
  }  );
}

function createLogins(cb) {
  async.parallel([
    function(callback) { loginCreate("sjgodden", ObjectId(users[0]._id), callback); },
    function(callback) { loginCreate("mjgodden5", ObjectId(users[1]._id), callback); },  ],
  cb);
}


function membershipCreate(user, account, role, accountemail, accountphone, cb) {
  membershipdetail = {
    _user: user,
    _account: account,
    _role: role,
    _accountemail: accountemail,
    _accountphone: accountphone
    }
    
  var membership = new Membership(membershipdetail);    
  membership.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Membership:', membership);
    memberships.push(membership)
    cb(null, membership)
  }  );
}

function createMemberships(cb) {
  async.parallel([
    function(callback) { membershipCreate(ObjectId(users[0]._id), ObjectId(accounts[0]._id), 'user', "sjgodden@googlemail.com", "123", callback); },
    function(callback) { membershipCreate(ObjectId(users[1]._id), ObjectId(accounts[1]._id), 'user', "mjgodden5@gmail.com", "123", callback); },  ],
  cb);
}

function accountCreate(name, plan, cb) {
  accountdetail = {
    _name: name,
    _plan: plan
    }
    
  var account = new Account(accountdetail);    
  account.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Account:', account);
    accounts.push(account)
    cb(null, account)
  }  );
}

function createAccounts(cb) {
  async.parallel([
    function(callback) { accountCreate("Selina Godden", 1, callback); },
    function(callback) { accountCreate("Marjorie Godden", 2, callback); },  ],
  cb);
}

async.series([
    createUsers,
    createLogins,
    createAccounts,
    createMemberships
  ],
  function(err, results) {
      if (err) {
          console.log('error:', err);
      }
      else {
          console.log('done');
      }
      mongoose.connection.close();
  });
