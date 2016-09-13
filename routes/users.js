var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('botest1883.cloudapp.net/nodeblog');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt= require('bcryptjs');

/* GET users listing. */
router.get('/login', function(req, res, next) {
  res.render('login',{title:'Login'});
});

router.post('/login',passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:true}),function (req, res, next) {
  req.flash('success','you are now logged in');
  res.redirect('/');

});

router.get('/register',function (req, res, next) {
  res.render('register',{title:'User Register'});
});

router.post('/register',function (req, res, next) {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;
  var registerdate= new Date();


  req.checkBody('username','Username filed is required').notEmpty();
  req.checkBody('email','Email filed is required').notEmpty();
  req.checkBody('email','Email is not validated').isEmail();
  req.checkBody('password','Password filed is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);
  req.checkBody('username','Username exsits').isUsernameAvailable();



  var errors= req.validationErrors();
  if(errors){

     res.render('register',{errors:errors});
  }else {
    var users= db.get('users');
    users.findOne({username: username}, {}, function (err, user) {
      if(user){
        var error = {param: "username", msg: "username already registered", value: req.body.username};
        if (!errors) {
          errors = [];
        }
        errors.push(error);
        res.render('register',{errors:errors});
      }else {
        var newpassword;
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(password, salt, function(err, hash) {
            newpassword=hash;
            users.insert({'username':username,'email':email,'password':newpassword,'registerdate':registerdate},function (err, user) {
              if(err){
                res.send(err);
              }else {

                passport.authenticate('local')(req, res, function () {
                  req.flash('success','User register is successed and logined.');
                  res.location('/');
                  res.redirect('/');
                })

              }
            });
          });
        });
      }
    })


  }


})


router.get('/logout',function (req, res, next) {
  req.logout();
  req.flash('success','You are now logged out.');
  res.redirect('/');
});



passport.serializeUser(function (user, done) {
  done(null,user);
});

passport.deserializeUser(function (user, done) {
  var users= db.get('users');
  users.findById(user._id,function (err, user) {
    done(err,user);
  });
});

passport.use(new LocalStrategy({passReqToCallback: true },function ( req,username, password, done) {
  var users= db.get('users');
  users.findOne({username:username},{},function (err, user) {
    if(err) throw err;
    if(!user){
      console.log('Unknown');
      return done(null,false,{message:'Unknown User'});
    }
    console.log(password);
    console.log(user.password);

    comparePassword(password,user.password,function (err, isMatch) {
      if(err) return done(err);
      if(isMatch){
        console.log('pass');
        return done(null,user)
      }else {
        console.log('test');
        return done(null,false,{message:'Invalid Password.'})
      }
    });
  });
}));

function comparePassword(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword,hash,function (err, isMatch) {
    callback(null,isMatch);
  });
};




module.exports = router;
