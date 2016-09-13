var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var multer = require('multer');
var upload = multer({ dest: './public/images' });
var flash = require('connect-flash');
var moment = require('moment');
var expressValidator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var azure = require('azure-storage');
var mongo = require('mongodb');
var db = require('monk')('botest1883.cloudapp.net/nodeblog');

var routes = require('./routes/index');
var posts = require('./routes/posts');
var categories = require('./routes/categories');
var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.locals.moment= require('moment');

app.locals.truncateText=function (text, length) {
  var truncatedText= text.substring(0,length);

  return truncatedText;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  },
  customValidators: {
    isUsernameAvailable: function(username) {
      return new Promise(function(resolve, reject) {
        var users = db.get('users');
        Users.findOne({username: username}, {}, function (err, user) {
          if (err) throw err;
          if (user) {
            console.log(user);
            resolve(user);
          } else {
            reject(user);
          }
        }).catch(function (error) {
          if (error) {
            reject(error);
          }
        });

      });

    }
  }
}));


// Connect-Flash
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Make our db accessible to our router
app.use(function(req,res,next){
  req.db = db;
  next();
});


app.get('*',function (req, res, next) {
  res.locals.user=req.user || null;
  next();
});
app.use('/', routes);
app.use('/posts', posts);
app.use('/categories',categories);
app.use('/users',users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



var server=app.listen(8099,'127.0.0.1',function () {
  var host = server.address().address
  var port = server.address().port

  console.log("vist http://%s:%s", host, port)

})
module.exports = app;
