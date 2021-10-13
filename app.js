const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
global.usingInternet = 1;
global.supersubSymbols;
global.fractionSymbols;
global.shapeSymbols;
global.symbolSymbols;
global.operatorSymbols;
global.arrowSymbols;

const app = express();
const config = require('dotenv').config();

app.use(
  helmet({
      contentSecurityPolicy: {
          directives: {
              defaultSrc: [
                "'self'"],
              connectSrc: [
                "'self'",
                "mongodb+srv://cluster0.j8m3g.mongodb.net"],
              imgSrc: [
                "'self'",
                "https://res.cloudinary.com/",
                "https://lh3.googleusercontent.com",
                "data:"],
              scriptSrc:[
                "'self'",
                "https://cdnjs.cloudflare.com/",
                "https://upload-widget.cloudinary.com",
                "https://media-library.cloudinary.com",
                "https://code.jquery.com",
                "https://maxcdn.bootstrapcdn.com",
                "https://cdn.jsdelivr.net",
                "'unsafe-inline'"],
              styleSrc:[
                "'self'",
                "https://cdnjs.cloudflare.com/",
                "https://maxcdn.bootstrapcdn.com",
                "https://cdn.jsdelivr.net",
                "'unsafe-inline'"],
              fontSrc:[
                "'self'","https://cdnjs.cloudflare.com/"],
              frameSrc:[
                "https://upload-widget.cloudinary.com",
                "https://cloudinary.com/"]
          },
      },
      //crossOriginEmbedderPolicy: true,
      //crossOriginOpenerPolicy: true,
      //crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(helmet.noSniff());
app.use(helmet.frameguard({ action: "deny", }));
app.use(helmet.hidePoweredBy());
app.use(helmet.xssFilter());
app.use(compression()); //Compress all routes

//Set up mongoose connection
const mongoose = require('mongoose');
const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:')); 

var _Symbol = require('./models/symbol');

// Get Symbols
(async () => {
  supersubSymbols = await _Symbol.find({type:"supersub"}).sort({index: "ascending"});
  fractionSymbols = await _Symbol.find({type:"fraction"}).sort({index: "ascending"});
  shapeSymbols = await _Symbol.find({type:"shape"}).sort({index: "ascending"});
  symbolSymbols = await _Symbol.find({type:"symbol"}).sort({index: "ascending"});
  operatorSymbols = await _Symbol.find({type:"operator"}).sort({index: "ascending"});
  arrowSymbols = await _Symbol.find({type:"arrow"}).sort({index: "ascending"});
})();
 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// favicon setup
var favicon = require('serve-favicon');
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//var session = require('express-session');
var session = require('cookie-session');

// config express-session
var sess = {
  secret: '0Kv7k_3ldeHI1tlj96jsLq103jSxbArw2',
  cookie: {},
  resave: false,
  saveUninitialized: true
};
if (app.get('env') === 'production') {
  // Use secure cookies in production (requires SSL/TLS)
  sess.cookie.secure = true;
  // Uncomment the line below if your application is behind a proxy (like on Heroku)
  // or if you're encountering the error message:
  // "Unable to verify authorization request state"
  // app.set('trust proxy', 1);
}
app.use(session(sess));

console.log('NODE_ENV', process.env.NODE_ENV);
console.log('AUTH0_CLIENT_ID', process.env.AUTH0_CLIENT_ID);
console.log('AUTH0_DOMAIN', process.env.AUTH0_DOMAIN);
console.log('MONGODB_URI', process.env.MONGODB_URI);
console.log('BASE_DOMAIN', process.env.BASE_DOMAIN);
// Load Passport
var passport = require('passport');
var Auth0Strategy = require('passport-auth0');
// Configure Passport to use Auth0
var strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL:
      process.env.AUTH0_CALLBACK_URL || 'http://' + process.env.BASE_DOMAIN + '/callback'
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  }
);
passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

// You can use this section to keep a smaller payload
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});

const userInViews = require('./middleware/userInViews');
const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const repoRouter = require('./routes/repo');
app.use(userInViews());
app.use('/', authRouter);
app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', repoRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, req.originalUrl));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
