const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const cors = require('cors');
const Models = require('./models');
const passport = require('passport');
require('./passport');

const app = express();

//CORS middlewear
let allowedOrigins = ['http://localhost:8080', 'http://localhost:1234'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));
// Body-Parser
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
//Auth
let auth = require('./auth')(app);
//Models
const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;

app.use(express.static(__dirname + '/public'));
//Mongoose middlewar body-parser
mongoose.connect('mongodb://EdisonAbdiel:114790931@moobee-shard-00-00.zpfes.mongodb.net:27017,moobee-shard-00-01.zpfes.mongodb.net:27017,moobee-shard-00-02.zpfes.mongodb.net:27017/test?ssl=true&replicaSet=atlas-6ude3z-shard-0&authSource=admin&retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

// Loggin
app.use(morgan('common'));

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to MooBee!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});
//Return a list of ALL movies to the user ADD THE PASSPORT AUTH CODE AGAIN ONCE USERS THEMSELVES CAN LOG IN
app.get('/movies', (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
//Return data (description, genre, director, image URL, whether it’s featured or not) about a single movie by title to the user
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ title: req.params.title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
//Return a movie by genre
app.get('/movies/:genre', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ genre: req.params.genre })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err)
        });
});
//Return data about a director (bio, birth year, death year) by name
app.get('/directors/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Directors.findOne({ name: req.params.name })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
//Returns the full list of directors to the user
app.get('/directors', passport.authenticate('jwt', { session: false }), (req, res) => {
    Directors.find()
        .then((director) => {
            res.status(201).json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error' + err)
        });
});
//Return data from a specific genre
app.get('/genres', passport.authenticate('jwt', { session: false }), (req, res) => {
    Genres.find()
        .then((genre) => {
            res.status(201).json(genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error' + err)
        });
});
//Return data about a genre (description) by name/title (e.g., “Thriller”)
app.get('/genres/:name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Genres.findOne({ name: req.params.name })
        .then((genre) => {
            res.json(genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error' + err)
        });
});
//Return full list of users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
//Return user by username
app.get('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ username: req.params.username })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// POST requests
// Allow new users to register
app.post('/users', [
    check('name', 'Apologies, name is required.').not().isEmpty(),
    check('username', 'Apologies, the username requires a minimum of 6 characters.').isLength({ min: 6 }),
    check('username', 'Apologies, the username only allows alphanumeric characters.').isAlphanumeric(),
    check('email', 'Apologies, the entered email does not seem to be valid').isEmail(),
    check('password', 'Apologies, the password requires a minimum of 8 characters.').isLength({ min: 8 }),
], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    console.log(hashedPassword);
    Users.findOne({ username: req.body.username })
        .then((user) => {
            if (user) { return res.status(400).send(`Apologies, the username "${req.body.username}" has already been taken.`) }
            else {
                Users.create({
                    name: req.body.name,
                    password: hashedPassword,
                    email: req.body.email,
                    username: req.body.username,
                    birthday: req.body.Birthday,
                })
                    .then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error:' + error)
                    })
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error:' + error)
        })
});
//Allow users to add a movie to their list of favorites
app.post('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});

// DELETE requests
//Allow existing users to deregister by username
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndDelete({ username: req.params.username })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.username + ' was not found');
            } else {
                res.status(200).send(req.params.username + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
//Allow users to remove favourite movie from their favourite list
app.delete('/users/:username/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username },
        { $pull: { FavoriteMovies: req.params.MovieID } },
        { new: true },
        (err, updatedFavourite) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedFavourite).send('Favorite movie has been removed');
            }
        });
});

// PUT requests
//Allow users to update their user info (username, password, email, date of birth)
app.put('/users/:_id', [
    check('name', 'Apologies, name is required.').not().isEmpty(),
    check('lastName', 'Apologies, last name is required.').not().isEmpty(),
    check('username', 'Apologies, the username requires a minimum of 6 characters.').isLength({ min: 6 }),
    check('username', 'Apologies, the username only allows alphanumeric characters.').isAlphanumeric(),
    check('email', 'Apologies, the entered email does not seem to be valid').isEmail(),
    check('password', 'Apologies, the password requires a minimum of 8 characters.').isLength({ min: 8 }),
  ], passport.authenticate('jwt', { session: false }), (req, res) => {
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findByIdAndUpdate({ _id: req.params._id }, {
        $set:
        {
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday
        }
    },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser).send(`The user: ${req.body.name} has been updated`);
            }
        });
});

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

// Serves static files
app.use(express.static('public'));

// Error handling 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
