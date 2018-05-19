process.env.NODE_ENV = 'test'

let chai = require('chai');
let chaiHttp = require('chai-http');
let mongoose = require('mongoose');
let server = require('../server');
let schema = require('../app/schema');

chai.use(chaiHttp);

var expect = chai.expect;
var should = chai.should;

describe('User CRUD testing', () => {
    describe('Retreive items from database', () => {
        it('Should get all items from the database', (done) => {
            chai.request(server)
                .get("/user")
                .end(function (err, res) {
                    res.should.have.status(200);
                    done();
                });
            done();
        });
    });

    describe('Insert item into database', () => {
        it('Should insert an item into the item details table', (done) => {
            let NewItem = {
                FirstName: "John",
                LastName: "Smith",
                UserName: "JSmith",
                Password: "John123",
                PasswordConf: "John123"
            }
            chai.request(server)
                .post('/user')
                .send(NewItem)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.NewItem.should.have.property('FirstName');
                    res.body.NewItem.should.have.property('LastName');
                    res.body.NewItem.should.have.property('UserName');
                    res.body.NewItem.should.have.property('Password');
                    done();
                });
            done();
        });
    });

    describe('Deleting a user', () => {

        it('Should not delete the wrong user', (done) => {
            chai.request(server)
                .get('/user')
                .end(function (err, res) {
                    res.should.have.status(500);
                    done();
                });
            done();
        });

        it('Should delete a user from users table', (done) => {
            let OldUser = {
                FirstName: "John",
                LastName: "Smith",
                UserName: "JSmith",
                Password: "John123",
                PasswordConf: "John123"
            }
            chai.request(server)
                .post('/user')
                .send(OldUser)
                .end(function (err, res) {
                    res.should.have.status(200);
                    usersID = res.body._id;

                    chai.request(server)
                        .get('/user/' + usersID)
                        .end(function (err, res) {
                            res.should.have.status(200);
                            done();
                        });
                    done();
                });
            done();
        });
    });

    describe('Update the users table', () => {
        it('Should be able change a users detials using the id', (done) => {
            let NewUser = {
                FirstName: "Jordan",
                LastName: "Belfort",
                UserName: "JBelfort",
                Password: "Jordan456",
                PasswordConf: "Jordan456"
            }
            let updatedUser = {
                FirstName: "J",
                LastName: "B",
                UserName: "JB",
                Password: "password",
                PasswordConf: "password"
            }
            chai.request(server)
                .post('/user')
                .send(NewUser)
                .end((err, res) => {
                    res.should.have.status(200);
                    userID = res.body._id;

                    chai.request(server)
                        .post('/user/' + userID)
                        .send(updatedUser)
                        .end(function (err, res) {
                            res.should.have.status(200);
                            res.body.should.be.an('object');
                            res.body.updatedUser.should.have.property('FirstName');
                            res.body.updatedUser.should.have.property('LastName');
                            res.body.updatedUser.should.have.property('UserName');
                            res.body.updatedUser.should.have.property('Password');
                            res.body.FirstName.should.equal('J');
                            res.body.LastName.should.equal('B');
                            res.body.UserName.should.equal('JB');
                            res.body.Password.should.equal('password');
                            done();
                        })
                    done();
                })
            done();
        });
    });
});

describe('Credential Verification Testing', () => {
    describe('Ensure the password match', () => {
        it('Verify the Password is correct', (done) => {
            schema.authenticate('RVerpoort', 'Ryan123', function (err, User) {
                expect(err).to.be.null;

            });
            done();
        });
    });

    describe('Verify password and continue', () => {
        it('Should Verify the users password', (done) => {
            let UserVerify = {
                logusername: "RVerpoort",
                logpassword: "Ryan123"
            }
            chai.request(server)
                .post('/login')
                .send(UserVerify)
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                });
            done();
        });
    });

    describe('Incorrect password does not continue', () => {
        it('Should Decline the users password', (done) => {
            let UserVerify = {
                logusername: "RVerpoort",
                logpassword: "Ryan000"
            }
            chai.request(server)
                .post('/login')
                .send(UserVerify)
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                });
            done();
        });
    });

    describe('All Fields must be filled out', () => {
        it('Should Decline the users password', (done) => {
            let UserVerify = {
                logusername: "RVerpoort"
            }
            chai.request(server)
                .post('/login')
                .send(UserVerify)
                .end(function (err, res) {
                    expect(res).to.have.status(400);
                });
            done();
        });
    });
});



describe('Cart CRUD testing', () => {
    describe('Insert a cart for a user', () => {
        it('Should insert a cart for the specified user', (done) => {
            let NewCart = {
                ListName: "DataBaseTestList",
                DateAdded: "200/200/200",
                DateLastModified: "200/200/200",
                Completed: false,
                Items: [],
                SharedWith: []
            }
            chai.request(server)
                .post('/add')
                .send(NewCart)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.ListName.should.equal('DataBaseTestList');
                    res.body.DateAdded.should.equal('200/200/200');
                    res.body.DateLastModified.should.equal('200/200/200');
                    done();
                });
            done();
        });
    });

    describe('Delete a cart for a user', () => {
        it('Should delete a cart for the specified user', (done) => {
            let NewCart = {
                ListName: "DataBaseTestList",
            }
            chai.request(server)
                .post('/delete')
                .send(NewCart)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    done();
                });
            done();
        });
    });

    describe('Read a cart and all its items for a user', () => {
        it('Should read a cart for the specified user', (done) => {
            var Listame = "List Two";
            chai.request(server)
                .get('/user/cart/' + Listame)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    done();
                });
            done();
        });
    });

    describe('Update a cart  completed status for a user', () => {
        it('Should be able change users cart from their id', (done) => {
            let NewCart = {
                ListName: "List 100",
                Completed: false,
            }
            let UpdatedCart = {
                ListName: "List 100",
                Completed: true,
            }
            chai.request(server)
                .post('/add')
                .send(NewCart)
                .end((err, res) => {
                    res.should.have.status(200);
                    chai.request(server)
                        .post('/completed')
                        .send(UpdatedCart)
                        .end(function (err, res) {
                            res.should.have.status(200);
                            res.body.should.be.an('object');
                            done();
                        })
                    done();
                })
            done();
        });
    });

});


describe('Item CRUD testing', () => {
    describe('Insert an item for a user cart', () => {
        it('Should insert an item for the specified user cart', (done) => {
            let NewItem = {
                ListName: "DataBaseTestList",
                ItemName: "Apples",
                Price: 200,
                Catregory: "Fruit",
                DateAdded: "200/200/200",
            }
            chai.request(server)
                .post('/addItem')
                .send(NewItem)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.ItemName.should.equal('Apples');
                    res.body.Price.should.equal(200);
                    res.body.Catregory.should.equal('Fruit');
                    res.body.DateAdded.should.equal('200/200/200');
                    done();
                });
            done();
        });
    });

    describe('Delete an item for a user List', () => {
        it('Should delete a cart for the specified user', (done) => {
            let NewItem = {
                ItemName: "Apples",
                ListName: "DataBaseTestList"
            }
            chai.request(server)
                .post('/delete')
                .send(NewItem)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    done();
                });
            done();
        });
    });

});

describe('Recipe API testing', () => {

    describe('Get list of recipes from ingredients', () => {
        it('Should return a list of recipes from ingredients', (done) => {
            let RecipeList = {
                Ingredients: "Ham,Cheese,Tomato"
            }
            chai.request(server)
                .post('/searchRecipe')
                .send(RecipeList)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    done();
                });
            done();
        });
    });

    describe('Get ingredients from the selected recipe', () => {
        it('Should return a list of ingredients', (done) => {
            let RecipeList = {
                RecipeID: "47187"
            }
            chai.request(server)
                .post('/addRecipeList')
                .send(RecipeList)
                .end(function (err, res) {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    done();
                });
            done();
        });
    });
});

describe('Cart sharing testing', () => {
    it('Should share a cart with another user of the site', (done) => {
      let NewItem = {
        ListName: 'DataBaseTestList',
        UserName: 'CRoss'
      }
      chai.request(server)
        .post('/user/share')
        .send(NewItem)
        .end(function (err, res) {
          res.should.have.status(200)
          res.body.should.be.an('object')
          done()
        })
      done()
    })
  });