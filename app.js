var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs = require('express-handlebars');
//var fileUpload = require('express-fileupload');
var busboyparser=require('busboy-body-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var forms = multer();
var app = express();
var db = require('./config/connection')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
app.use(busboyparser());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
db.connect((err)=>{
  if(err) console.log('connection error'+err);
  else console.log('Database Connected Successfully');
});

app.use('/', userRouter);
app.use('/admin', adminRouter);
//app.use(fileUpload());

//app.use(bodyParser.json());
//app.use(forms.array()); 
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(multer().array());
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
