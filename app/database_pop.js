var mongoose = require('mongoose');

//The connection string for the mlab mongo DB server 
var mongoDB = "mongodb://admin:seguked5vU-e@ds014578.mlab.com:14578/shopping_test";

mongoose.connect(mongoDB, {
    useMongoClient: true
});

// connect to the database
var db = mongoose.connection;


db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//create the UserCredentials Table
db.createCollection("UserCredentials")

//Populate the users table
db.collection('UserCredentials').insert({ FirstName: "Arlo", LastName: "Eardley", UserName: "AEardley", Password: "Arlo123"})
db.collection('UserCredentials').insert({ FirstName: "Carel", LastName: "Ross", UserName: "CRoss", Password: "Carel123"})
db.collection('UserCredentials').insert({ FirstName: "Ryan", LastName: "Verpoort", UserName: "RVerpoort", Password: "Ryan123"})
db.collection('UserCredentials').insert({ FirstName: "Laura", LastName: "West", UserName: "LWest", Password: "Laura123"})
