var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport	  = require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var port 	      = process.env.PORT || 8085;
var jwt 			  = require('jwt-simple');
var bcrypt = require('bcrypt');

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.end();
  } else {
    next();
  }
});
// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

// demo Route (GET http://localhost:8080)
app.get('/', function(req, res) {
  res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// connect to database
mongoose.connect(config.database);

// pass passport for configuration
require('./config/passport')(passport);

// bundle our routes
var apiRoutes = express.Router();


// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function(req, res) {
  if (!req.body.name || !req.body.password || !req.body.email || !req.body.access_level) {
    res.json({success: false, msg: "Saississez un nom d'utilisateur/mot de passe/email/droit d'accès valide"});
  } else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
      access_level: req.body.access_level
    });
    // save the user
    //TODO get voir si le name existe deja

    console.log('create new user: ' + newUser);
    newUser.save(function(err) {
      if (err) {
        res.json({success: false, msg: "Ce nom d'utilisateur est déjà existant"});
        throw err;
      }
      res.json({success: true, msg: 'Utilisateur créé avec succés'});
    });
  }
});

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.json({success: false, msg: "L'utilisateur n'existe pas"});
      //return res.status(403).send({success: false, msg: "Echec de connexion: l'utilisateur n'existe pas"});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token, msg: 'Vous êtes désormais connecté'});
        } else {
          res.json({success: false, msg: 'Mauvais mot de passe'});
          //return res.status(403).send({success: false, msg: 'Echec de connexion : mauvais mot de passe'});
        }
      });
    }
  });
});

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  //console.log('the token: ' + token);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.json({success: false, msg: "l'utilisateur n'existe pas"});
      } else {
        res.json({success: true, msg: 'Bienvenue ' + user.name + '!', name: user.name});
      }
    });
  } else {
    return res.status(403).send({success: false, msg: 'Impossible de lire le token généré'});
  }
});

// retoune un tableau contenant la liste (sous forme de structure) des utilisateurs stockées en bdd
apiRoutes.get('/usersList', function(req, res) {

  User.find([], function(err, users) {
    /*var userMap = {};
    var i =1;
    users.forEach(function(user) {
      userMap[i] = user;
      i++;
    });*/

  res.json(users);
});
});



//permet de mettre à jour un champ
apiRoutes.put('/updateuserp', function(req, res) {
  var userToUpdate = req.body.name;
  var password_hashed;
  User.findOne({
    name: userToUpdate
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.json({success: false, msg: "l'utilisateur n'existe pas"});
    } else {

      if(!req.body.access_level || !req.body.newpassword || !req.body.newemail){
       res.json({success: false, msg: "Paramètres manquants dans la requette"});
     }else{

            //cryptage du mot de passe
            bcrypt.genSalt(10, function (err, salt) {
              if (err) {
                return next(err);
              }
              bcrypt.hash(req.body.newpassword, salt, function (err, hash) {
                if (err) {
                  console.log(err);
                }
                password_hashed = hash;
                //on modifie en BDD
                User.findOneAndUpdate({name: userToUpdate}, {access_level : req.body.access_level , email : req.body.newemail , password : password_hashed}, function(err) {
                  if (err){
                   throw err;
                   res.json({success: false, msg: "Erreur lors de la mise à jour de l'utilisateur"});
                 }else{
                   res.json({success: true, msg: "Les informations de l'utilisateur on bien été mises à jour"});
                 }

               });
              });
            });

          }

        }
      });
});

//permet de mettre à jour un champ
apiRoutes.put('/updateuser', function(req, res) {
  var userToUpdate = req.body.name;
  var password_hashed;
  User.findOne({
    name: userToUpdate
  }, function(err, user) {
    console.log("on est dedans");
    if (err) throw err;

    if (!user) {
      res.json({success: false, msg: "l'utilisateur n'existe pas"});
    } else {

      if(!req.body.access_level || !req.body.newemail){
       res.json({success: false, msg: "Paramètres manquants dans la requette"});
     }else{

            //on modifie en BDD
            User.findOneAndUpdate({name: userToUpdate}, {access_level : req.body.access_level , email : req.body.newemail }, function(err) {
              if (err){
               throw err;
               res.json({success: false, msg: "Erreur lors de la mise à jour de l'utilisateur"});
             }else{
               res.json({success: true, msg: "Les informations de l'utilisateur on bien été mises à jour"});
             }

           });

          }

        }
      });
});

// retoune un tableau contenant la liste (sous forme de structure) des utilisateurs stockées en bdd
apiRoutes.post('/deleteuser', function(req, res) {

  var userToDelete = req.body.name;
  console.log(userToDelete);
  User.findOne({
    name: userToDelete
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.json({success: false, msg: "l'utilisateur n'existe pas"});
    } else {
      User.remove({ name: userToDelete }, function (err) {
        if (err){
         throw err;
         res.json({success: false, msg: "Erreur lors de la suppression de l'utilisateur"});
       }else{
         res.json({success: true, msg: "L'utilisateur à bien été supprimé"});
       }

     });
    }
  });
});



getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// connect the api routes under /api/*
app.use('/api', apiRoutes);

// Start the server
app.listen(port);
console.log('Serveur lance: http://localhost:' + port);