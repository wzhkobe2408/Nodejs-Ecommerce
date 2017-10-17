var router = require('express').Router();
var User = require('../models/user');
var async = require('async');
var passport = require('passport');
var passportConf = require('../config/passport');
var Cart = require('../models/cart');

router.get('/login',function(req, res){
  if(req.user) return res.redirect('/');
  res.render('accounts/login',{
    message:req.flash('loginMessage')
  });
})

router.post('/login', passport.authenticate('local-login',{
  successRedirect:'/profile',
  failureRedirect:'/login',
  failuerFlash:true
}));


router.get('/profile', function(req, res, next){
  User.findOne({_id:req.user._id}, function(err, user){
    if(err) return next(err);
    res.render('accounts/profile',{user: user});
  });
});

router.get('/signup', function(req, res, next){
  res.render('accounts/signup',{
    errors:req.flash('errors')
  });
});

//Create user
router.post('/signup', function(req, res, next){

  async.waterfall([
    function(callback){
      var user = new User();
      user.profile.name = req.body.name;
      user.password = req.body.password;
      user.email = req.body.email;
      user.profile.picture = user.gravatar();

      User.findOne({ email:req.body.email },function(err,existingUser){
        if(existingUser){
          req.flash('errors','Account with that email already exists');
          return res.redirect('/signup');
        }else {
          user.save(function(err, user, next){
            if(err) return next(err);
            callback(null, user);
          });
        }
      });
    },
    function(user){
      var cart = new Cart();
      cart.owner = user._id;
      cart.save(function(err){
        if(err) return next(err);
        req.logIn(user, function(err){
          if(err) return next(err);
          res.redirect('/profile');
        });
      });
    }
  ]);
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
})

router.get('/edit-profile', function(req, res, next){
  res.render('accounts/edit-profile',{
    message:req.flash('success')
  });
});

router.post('/edit-profile', function(req, res, next){
  User.findOne({_id:req.user._id}, function(err, user){
    if(err) return next(err);
    if(req.body.name) user.profile.name = req.body.name;
    if(req.body.address) user.address = req.body.address;
    user.save(function(err){
      if(err) return next(err);
      req.flash('success','Successfully Edited your profile');
      return res.redirect('/edit-profile');
    });
  });
});

module.exports = router;
