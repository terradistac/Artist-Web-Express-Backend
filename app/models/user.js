// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

var ArtworkSchema = new mongoose.Schema({
    artworkname: String,
    artworkfilelocation: String,
    tags: [String]
})

// define the schema for our user model
var userSchema = mongoose.Schema({

    local: {
        email: String,
        password: String,
        name: String,
        biography: String,
        art: [ArtworkSchema]
    }

});

// methods ======================
// generating a hash

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);