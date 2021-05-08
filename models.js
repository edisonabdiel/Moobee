const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, required: true },
    genre: [String],
    description: { type: String, required: true },
    imgUrl: String
});

let userSchema = mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
