var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');

//Config
var secret = require('./config/secret');
//Models
var User = require('./models/user');
var Category = require('./models/category');

var cartLength = require('./middlewares/middlewares');

var app = express();

//Database
mongoose.connect(secret.database, function(err){
  if(err) console.log(err);
  else console.log('Connected to the database');
});

app.use(express.static('public'));
app.use(morgan('dev'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  resave:true,
  saveUninitialized:true,
  secret:secret.secretKey,
  store:new MongoStore({url:secret.database, autoReconnect:true})
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(cartLength);

app.use(function(req, res, next) {
  Category.find({}, function(err, categories) {
    if(err) return next(err);
    res.locals.categories = categories;
    next();
  });
});

app.set('views', './views');
app.engine('ejs', engine);   //define engine
app.set('view engine','ejs');  // register the template engine

//Routes
var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api',apiRoutes);

//Listening on port
app.listen(secret.port,function(err){
  if(err) throw err;
  console.log('Server is listening on port '+secret.port);
})
