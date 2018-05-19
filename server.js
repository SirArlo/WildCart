'use strict'

//let path = require('path');
let express = require('express');
let mongoose = require('mongoose');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let config = require('./app/config_test');
let schema = require('./app/schema');

mongoose.connect(config.DB)

let app = express();
let port = 5000;
let db = mongoose.connection;
let mainRouter = require('./routes/mainRoutes');
let userRouter = require('./routes/userRoutes');
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
   // the database is connected
});

app.use('/styles',express.static( 'views' ) ) ;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(session({
    secret: 'whatteam??',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

app.use('/', mainRouter);
app.use('/user', userRouter);

// catch the page not found 404 error
app.use(function (req, res, next) {
    var err = new Error('404 File Not Found');
    err.status = 404;
    next(err);
});

// error handling  function
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
});

app.listen(process.env.PORT||port);
console.log("Port: " + port + " is being used by the app");

module.exports = app;