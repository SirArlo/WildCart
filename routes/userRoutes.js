let path = require('path');
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let UserScheme = require('../app/schema');

router.route('/')
    .get(function(req, res) {
        //query the databse and get all the users
        let query = UserScheme.find({});
        query.exec((err, user) => {
            if (err) res.send(err);
            //If no errors, send them back to the client
            res.json(user);
        });
    })
    .post(function(req, res) {
        //query the databse and get all the users
        var newUser = new UserScheme(req.body);
        newUser.save((err, user) => {
            if (err) res.send(err);
            //If no errors, send it back to the client
            res.json({ message: "User successfully added!", user });
        });
    });

    router.get('/username', function (req, res, next) {
        UserScheme.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    return next(err);
                } else {
                    var data = { FirstName: user.FirstName, UserName: user.UserName };
                    res.json(data);
                }
            }
        });
    });
        
router.get('/carts', function (req, res, next) {
        UserScheme.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    return next(err);
                } else {
                    //var data = user.Lists;
                    var i;
                    var ShoppingLists = [];
                    for (i = 0; i < user.Lists.length; i++) {
                        ShoppingLists[i] = user.Lists[i].ListName;
                    }
                    res.json(ShoppingLists);
                }
            }
        });
});

router.post('/share', function (req, res) {
    UserScheme.find(
        {"_id":req.session.userId},{"Lists":{$elemMatch:{"ListName": req.body.ListName}}},
        (err, result) => {
            for (var key in result) {
                Data = result[key].Lists[0]
            }
            UserScheme.findOne(
                { "_id": req.session.userId},
                (err, result) => { 
                  var Username = result.UserName
                    Data.ListName = Data.ListName + "-" + Username;

                    UserScheme.findOne(
                        { "UserName": req.body.UserName, "Lists.ListName": Data.ListName },
                        (err, result) => {
                            if (result) {
                                
                                res.send("List already Exists");
                                
                            } else {
                                UserScheme.update(
                                    { "UserName": req.body.UserName },
                                    { $push: { "Lists": Data } }, (err, result) => {
                                        console.log(result)
                                    });

                                    UserScheme.update(
                                    { "_id": req.session.userId, "Lists.ListName": req.body.ListName },
                                    { $push: { "Lists.$.SharedWith": req.body.UserName } }, (err, result) => {
                                        console.log(result)
                                    });

                                res.send("List sucessfully updated");
                }
            });       
        });
    });
});

router.route('/cart/:List')
    .put(function (req, res) {
        UserScheme.update({ "_id": req.session.userId, "Lists.ListName": req.params.List },
        { $set: { 'Lists.$.ListName': req.body.ListName } }, function (err, result) {
            if (err) {
                console.log(err)
            } else {
               res.json({ message: "List successfully updated", result })
          }
        })
    })
    .get(function (req, res, next) {
        UserScheme.findById(req.session.userId)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    if (user === null) {
                        var err = new Error('Not authorized! Go back!');
                        err.status = 400;
                        return next(err);
                    } else {
                        //var data = user.Lists;
                        var i;
                        for (i = 0; i < user.Lists.length; i++) {
                            if (user.Lists[i].ListName === req.params.List)
                                break;
                        }
                        var data = { Items: user.Lists[i].Items, ListName: user.Lists[i].ListName, UserName: user.FirstName, url: "/items" }
                        res.json(data);
                        //res.json(user.Lists[i].Items);
                        //return res.redirect('/items');
                    }
                }
            });
    });

router.route("/:id")
    .get(function (req, res) {
        UserScheme.findById(req.params.id, (err, User) => {
            if (err) res.send(err);
            //If no errors, send it back to the client
            res.json(User);
        })
    })
    .delete(function(req, res) {
        UserScheme.remove({ _id: req.params.id }, (err, result) => {
            res.json({ message: "User successfully deleted", result });
        });
    })
    .put(function(req, res) {
        UserScheme.findById({ _id: req.params.id }, (err, user) => {
            if (err) res.send(err);
            Object.assign(user, req.body).save((err, user) => {
                if (err) res.send(err);
                res.json({ message: 'User updated', user });
            });
        });
    });

module.exports = router;