var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken');
var config = require('./config');
var User   = require('./app/models/user');

var port = process.env.PORT || config.port;
mongoose.connect(config.database);
app.set('superSecret', config.secret);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(morgan('dev'));


app.get('/', function(req, res) {
    res.send(`Coucou ! The API is at http://localhost:' + ${port} + '/api`);
});

app.get('/setup', function(req, res) {

  // creation d'un utilisateur fake
  var nick = new User({
    name: 'roro-sensei',
    password: 'mot2passe',
    admin: true
  });

  // sauvegarder l'utilisateur
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});

// API ROUTES -------------------

var apiRoutes = express.Router();

// TODO: route for authenticate user (POST http://localhost:8080/api/authenticate)

// TODO: route middleware to verify a token

//  (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on Simplon!' });
});

// (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

app.use('/api', apiRoutes);

app.listen(port);
console.log(`Magic happens at http://localhost:' + ${port}`);
