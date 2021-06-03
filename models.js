const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, required: true },
    genre: [String],
    description: { type: String, required: true },
    imgUrl: String
});

let userSchema = mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String , required: true },
    username: { type: String, required: true },
    birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.statics.hashPassword = function(password) {
    return bcrypt.hashSync(password, 10);
}

userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.password)
}

let directorSchema = mongoose.Schema({
    name: { type: String, required: true },
    bio: { type: String, required: true },
    born: Date
});

let genreSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }
})

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Director = mongoose.model('Director', directorSchema);
let Genre = mongoose.model('Genre', genreSchema);

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Director = Director;
module.exports.Genre = Genre;
