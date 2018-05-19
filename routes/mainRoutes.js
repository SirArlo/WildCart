let path = require('path');
let express = require('express');
let User = require('../app/schema');
var unirest = require('unirest');
let router = express.Router();

router.get('/', function (req, res, next) {
    return res.sendFile(path.join(__dirname, '../views', 'login', 'login.html'));
});

router.get('/carts',function(req, res){
    res.sendFile(path.join(__dirname,'../views','carts','view.html'));
});

router.get('/profile', function (req, res) {
    res.sendFile(path.join(__dirname, '../views', 'login', 'profile.html'));
});

router.get('/register', function (req, res) {
    res.sendFile(path.join(__dirname, '../views', 'login', 'register.html'));
});

router.get('/recipe', function (req, res) {
    res.sendFile(path.join(__dirname, '../views', 'recipe', 'recipe.html'));
});


router.post('/login', function (req, res, next) {
    if (req.body.logusername && req.body.logpassword) {
        User.authenticate(req.body.logusername, req.body.logpassword, function (error, user) {
            if (error || !user) {
                var err = new Error('Wrong username or password');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/carts');
            }
        });
    } else {
        var err = new Error('All fields need to be filled in');
        err.status = 400;
        return next(err);
    }
})

router.post('/register', function (req, res, next) {
    // confirm that user typed same password twice
    if (req.body.password !== req.body.passwordConf) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        res.send("Passwords do not match");
        return next(err);
    }

    if (req.body.FirstName &&
        req.body.LastName &&
        req.body.username &&
        req.body.password &&
        req.body.passwordConf) {
        var userData = {
            FirstName: req.body.FirstName,
            LastName: req.body.LastName,
            UserName: req.body.username,
            Password: req.body.password,
            PasswordConf: req.body.passwordConf,
        }

        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                return res.redirect('/carts');
            }
        });

    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
})

router.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete the session object when logging out
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.post('/completed', function (req, res) {
    User.update({ "_id": req.session.userId, "Lists.ListName": req.body.ListName }, { $set: { 'Lists.$.Completed': req.body.Completed } }, function (err, result) {
        if (err) {
            console.log(err)
        } else {
            res.json({ message: "List successfully updated", result })
        }
    })

});

router.post('/add', function (req, res) {
    console.log(req.body)
    User.update(
        { _id: req.session.userId},
        { $push: { "Lists": req.body } }, { _id: false }, (err, result) => {
        res.json({ message: "List successfully added", result });
        });
    });

router.post('/delete', function (req, res) {
    User.update(
        { _id: req.session.userId }, { $pull: { "Lists": { ListName: req.body.ListName } } },
        { multi: false, upsert: true }, (err, result) => {
            res.json({ message: "List successfully deleted", result });
        });
});

router.post('/searchRecipe', function (req, res) {

    var search = req.body.Ingredients;
    search.replace(/,/g, "%2C");
    search.replace(/ /g, '');

    unirest.get("https://community-food2fork.p.mashape.com/search?key=f2497577c73e9c677548bc881f354912&q=" + search)//912&q=mince%2Cham%2Ccheese"
        .header("X-Mashape-Key", "CUU4KLr9EcmshMnRnPQius5I1Bs2p10uiNajsnUd40uHWiVuap")
        .header("Accept", "application/json")
        .end(function (result) {
            var i;
            var RecipeName = [];
            var RecipeId = [];
            var RecipeLink = [];
            var data = JSON.parse(result.body)
            for (i = 0; i < data.recipes.length; i++) {
                RecipeName[i] = data.recipes[i].title;
                RecipeId[i] = data.recipes[i].recipe_id
                RecipeLink[i] = data.recipes[i].source_url
            }
            res.json({ Recipes: RecipeName, RecipeID: RecipeId, Link: RecipeLink });
        });
});

router.post('/addRecipeList', function (req, res) {
    var ID = req.body.RecipeID;
    unirest.get("https://community-food2fork.p.mashape.com/get?key=f2497577c73e9c677548bc881f354912&rId=" + ID)
        .header("X-Mashape-Key", "CUU4KLr9EcmshMnRnPQius5I1Bs2p10uiNajsnUd40uHWiVuap")
        .header("Accept", "application/json")
        .end(function (result) {
            var data = JSON.parse(result.body);
            var Ingredients = [];
            for (i = 0; i < data.recipe.ingredients.length; i++) {
                Ingredients[i] = data.recipe.ingredients[i]
            }
            var IngredientItems = [];
            var j;
            var myObject = {};
            for (j = 0; j < Ingredients.length; j++) {
                var myObject = {};
                myObject.ItemName = Ingredients[j];
                myObject.Price = 0;
                myObject.Catregory = "";
                myObject.DateAdded = req.body.Date,
                IngredientItems.push(myObject);
            }
            var data = {
                ListName: req.body.RecipeName,
                DateAdded: req.body.Date,
                DateLastModified: req.body.Date,
                Completed: false,
                SharedWith: [],
                Items: IngredientItems,
            }
            User.update(
                { "_id": req.session.userId },
                { $push: { "Lists": data } }, (err, result) => {
                    res.json({ message: "List successfully added", result });
                });
        });
});

router.post('/addItem', function (req, res) {
    User.update(
        { "_id": req.session.userId, "Lists.ListName": req.body.ListName },
        { $push: { "Lists.$.Items": req.body } }, { _id: false }, (err, result) => {
            res.json({ message: "Item successfully added", result });
        });
});

router.get('/items', function (req, res) {
    res.sendFile(path.join(__dirname, '../views', 'items', 'items.html'));
});

router.post('/deleteItem', function (req, res) {
    User.update(
        { "_id": req.session.userId, "Lists.ListName": req.body.ListName }, { $pull: { "Lists.$.Items": { ItemName: req.body.ItemName } } },
        { multi: false, upsert: true }, (err, result) => {
            res.json({ message: "Item successfully deleted", result });
        });
});

router.post('/updateItem', function (req, res) {
    var Price = req.body.Price
    Price = Price.replace(/R/g, "");
    User.update(
        { "_id": req.session.userId, "Lists.ListName": req.body.ListName }, { $pull: { "Lists.$.Items": { ItemName: req.body.OldItemName} } },
        { multi: false, upsert: true }, (err, result) => {
            console.log(result)
            var data = {
                ItemName: req.body.ItemName,
                Price: Number(Price),
                Catregory: req.body.Catregory,
                DateAdded: req.body.DateAdded
            }

            User.update(
                { "_id": req.session.userId, "Lists.ListName": req.body.ListName },
                { $push: { "Lists.$.Items": data } }, { _id: false }, (err, result) => {
                    console.log(result)
                    res.json({ message: "Item successfully added", result });
                });
        });
});

module.exports = router;