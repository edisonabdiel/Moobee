const express = require('express');
const morgan = require('morgan');;
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models');

const app = express();
app.use(bodyParser.json());

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

app.get('/users/:username/favorites', (req, res) => {
    res.send("list of favorites")
});

// POST requests

app.post('/users', (req, res) => {
    Users.findOne({ username: req.body.username })
        .then((user) => {
            if (user) { return res.status(400).send(req.body.username + "already exists") }
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

app.post('/users/:username/Movies/:MovieID', (req, res) => {
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

app.post('/users/:username/movies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
        { new: true }, // This line makes sure that the updated document is returned
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

app.delete('/users/:username/favorites/:movie', (req, res) => {
    res.send("remove from favorites")
});

app.delete('/users/:username', (req, res) => {
    Users.findOneAndRemove({ username: req.params.username })
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

// PUT requests

app.put('/users/:username', (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, {
        $set:
        {
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
                res.json(updatedUser);
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
