const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models');
const passport = require('passport');
require('./passport');

const app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

let auth = require('./auth')(app);

const Movies = Models.Movie;
const Users = Models.User;
const Directors = Models.Director;
const Genres = Models.Genre;

app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb://localhost:27017/moobee', { useNewUrlParser: true, useUnifiedTopology: true });

// Loggin
app.use(morgan('common'));

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to MooBee!');
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});
//Return a list of ALL movies to the user
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/:title', (req, res) => {
    Movies.findOne({ title: req.params.title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/movies/:genre', (req, res) => {
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
app.get('/directors/:name', (req, res) => {
    Directors.findOne({ name: req.params.name })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/directors', (req, res) => {
    Directors.find()
        .then((director) => {
            res.status(201).json(director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error' + err)
        });
});

app.get('/genres', (req, res) => {
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
app.get('/genres/:name', (req, res) => {
    Genres.findOne({ name: req.params.name })
        .then((genre) => {
            res.json(genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error' + err)
        });
});

app.get('/users', (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

app.get('/users/:username', (req, res) => {
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
app.post('/users', (req, res) => {
    Users.findOne({ username: req.body.username })
        .then((user) => {
            if (user) { return res.status(400).send(`Apologies, the username "${req.body.username}" has already been taken.`) }
            else {
                Users.create({
                    name: req.body.name,
                    password: req.body.password,
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
app.post('/users/:username/movies/:MovieID', (req, res) => {
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
//Allow existing users to deregister
app.delete('/users/:username', (req, res) => {
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

app.delete('/users/:username/movies/:MovieID', (req, res) => {
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
app.put('/users/:_id', (req, res) => {
    Users.findByIdAndUpdate({ _id: req.params._id }, {
        $set:
        {
            name: req.body.name,
            username: req.body.username,
            password: req.body.password,
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
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});

// Serves static files
app.use(express.static('public'));

// Error handling 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
