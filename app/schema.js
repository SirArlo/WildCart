// create a schema for the users table on the database
var mongoose = require('mongoose')
var bcrypt = require('bcrypt');

var UserCredentials = new mongoose.Schema(
    {
        FirstName: { type: String, required: true },
        LastName: { type: String, required: true },
        UserName: { type: String, required: true },
        Password: { type: String, required: true },
        PasswordConf: { type: String, required: true },
        Lists: [{
            ListName: {type: String},
            DateAdded:{ type: String },
            DateLastModified: { type: String },
            Completed: {type: Boolean},
            Items: [
                {
                    ItemName: { type: String },
                    Price: { type: Number },
                    Catregory: { type: String },
                    DateAdded: { type: String },
                }]
        }],
        SharedWith: [{
            UserName: { type: String }
        }]
    },

    {
        collection: 'UserCredentials'
    }
)

//authenticates the user password and username against the database
UserCredentials.statics.authenticate = function (UserName, Password, callback) {
    User.findOne({ UserName: UserName })
        .exec(function (err, user) {
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found');
                err.status = 401;
                return callback(err);
            }
            //compare the hashed passwords to see if they match
           bcrypt.compare(Password, user.Password, function (err, result) {
                if (result === true) {
                    return callback(null, user);
                } else {
                    return callback();
                }
            })
        });
}

//hashing a password before saving it to the database
UserCredentials.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.Password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.Password = hash;
        next();
    })
});

var User = mongoose.model('User', UserCredentials); 
module.exports = User;
