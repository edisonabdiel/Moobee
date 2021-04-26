const express = require('express');
const app = express();
const morgan = require('morgan');


let topMooBees = [
  {
    title: 'Dracula',
    director: 'Francis Ford Coppola'
  },
  {
    title: 'There Will Be Blood',
    director: 'Paul Thomas Anderson'
  },
  {
    title: 'The House that Jack Built',
    director: 'Lars Von Trier'
  },
  {
    title: 'The House that Jack Built',
    director: 'Lars Von Trier'
  },
  {
    title: 'The Antichrist',
    director: 'Lars Von Trier'
  },
  {
    title: 'Into the Wild',
    director: 'Sean Penn'
  },
  {
    title: 'Oldboy',
    director: 'Park Chan-wook'
  },
  {
    title: 'The Master',
    director: 'Paul Thomas Anderson'
  },
  {
    title: 'Snatch',
    director: 'Guy Ritchie'
  },
  {
    title: 'Dogville',
    director: 'Lars Von Trier'
  }
];

// Loggin
app.use(morgan('common'));

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to MooBee!');
});

app.get('/documentation', (req, res) => {                  
  res.sendFile('public/documentation.html', { root: __dirname });
});

app.get('/moobees', (req, res) => {
  res.json(topMooBees);
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
  