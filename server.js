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

apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

  }
});

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
apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentification raté. User pas trouvé.' });
    } else if (user) {

      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentification raté. bad password.' });
      } else {


    const payload = {
      admin: user.admin
    };
        var token = jwt.sign(payload, app.get('superSecret'), {
          expiresIn : 60*60*24 // expires in 24 hours
        });

        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }

    }

  });
});


app.use('/api', apiRoutes);

app.listen(port);
console.log(`Magic happens at http://localhost:' + ${port}`);
