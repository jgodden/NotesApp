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

function userCreate(firstname, lastname, username, email, cb) {
  userdetail = {
    firstname: firstname,
    lastname: lastname,
    username: username,
    email: email
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
    function(callback) { userCreate("Sam", "Godden", "sam.godden", "samjgodden@gmail.com", callback); },
    function(callback) { userCreate("Jon", "Godden", "jon.godden", "jongodden@gmail.com", callback); },  ],
  cb);
}

function loginCreate(username, user, cb) {
  logindetail = {
    username: username,
    user: user
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
    function(callback) { loginCreate("sam.godden", ObjectId(users[0]._id), callback); },
    function(callback) { loginCreate("jon.godden", ObjectId(users[1]._id), callback); },  ],
  cb);
}


function membershipCreate(user, account, role, accountemail, accountphone, cb) {
  membershipdetail = {
    user: user,
    account: account,
    role: role,
    accountemail: accountemail,
    accountphone: accountphone
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
    function(callback) { membershipCreate(ObjectId(users[0]._id), ObjectId(accounts[0]._id), 'user', "16sgodden@guildfordcounty.co.uk", "123", callback); },
    function(callback) { membershipCreate(ObjectId(users[1]._id), ObjectId(accounts[1]._id), 'admin', "jon.godden@sita.aero", "123", callback); },  ],
  cb);
}

function accountCreate(name, plan, cb) {
  accountdetail = {
    name: name,
    plan: plan
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
    function(callback) { accountCreate("Sam Godden", 1, callback); },
    function(callback) { accountCreate("Jon Godden", 2, callback); },  ],
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
