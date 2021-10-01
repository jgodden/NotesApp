const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const repoRouter = require('./routes/repo');  //Import routes for "repo" area of site
const compression = require('compression');
const helmet = require('helmet');
global.usingInternet = 1;
global.numberSymbols;
global.fractionSymbols;
global.shapeSymbols;
global.symbolSymbols;
global.operatorSymbols;
global.arrowSymbols;

const app = express();

app.use(
  helmet({
      contentSecurityPolicy: {
          directives: {
              defaultSrc: ["'self'"],
              connectSrc: ["'self'", "mongodb+srv://cluster0.j8m3g.mongodb.net"],
              imgSrc: ["'self'", "http://127.0.0.1:8080", "http://res.cloudinary.com/", "data:"],
              scriptSrc:["'self'","https://cdnjs.cloudflare.com/",
                "https://upload-widget.cloudinary.com",
                "https://media-library.cloudinary.com",
                "'unsafe-inline'"],
              styleSrc:["'self'","https://cdnjs.cloudflare.com/", "'unsafe-inline'"],
              fontSrc:["'self'","https://cdnjs.cloudflare.com/"],
              frameSrc:[ "https://upload-widget.cloudinary.com",
                "https://cloudinary.com/"]
          }
      },
  })
);
app.use(compression()); //Compress all routes

//Set up mongoose connection
const mongoose = require('mongoose');
const atlas_db_url = 'mongodb+srv://Admin:M4rmoset52@cluster0.j8m3g.mongodb.net/NotesApp?retryWrites=true';
const local_db_url = 'mongodb://127.0.0.1:27017/local';
const mongoDB = process.env.MONGODB_URI || atlas_db_url;
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
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/repo', repoRouter);  // Add repo routes to middleware chain.

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
