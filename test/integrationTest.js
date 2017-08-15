const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const {UserContact} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for name, totalAmount, ssn
// and then we insert that data into mongo
function seedUserData() {
  console.info('seeding user data');
  const seedData = [];

  for (let i=1; i<=1; i++) {
    seedData.push(generateUserData());
  }
  // this will return a promise
  return UserContact.insertMany(seedData);
}

// generate an object represnting a user with rides.
// can be used to generate seed data for db
// or request.body data
function generateUserData() {
    return {
        userId: "guest",
        password: "$2a$10$5Pr8yrQmejJhdgh8wizpUedShkVc3rBI53gKKqUnaKgTEP6N3kkJC",
        rides:
            [
                {
                    _id: "597b419ac5f8ec859d8e0463",
                    rideDate: faker.date.past(),
                    stationFrom: "E40St&amp;5Ave",
                    stationTo: "NassauSt&amp;NavySt",
                    cost: "3,543.33",
                    paymentType: "Cash",
                    bikeType: "E-Bikes"
                }
            ]


    }
}

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure  ata from one test does not stick
// around for next one
    function tearDownDb() {
        console.warn('Deleting database');
        return mongoose.connection.dropDatabase();
    }

    describe('User API resource', function () {

        // we need each of these hook functions to return a promise
        // otherwise we'd need to call a `done` callback. `runServer`,
        // `seedUserData` and `tearDownDb` each return a promise,
        // so we return the value returned by these function calls.
        before(function () {
            return runServer(TEST_DATABASE_URL);
        });

        beforeEach(function () {
            return seedUserData();
        });

        afterEach(function () {
            return tearDownDb();
        });

        after(function () {
            return closeServer();
        })


        describe('GET endpoint for signing in', function() {

            it('should sign in user and return user account', function() {
                let res;
                let agent = chai.request.agent(app);
                return agent
                    .get('/users/login')
                    .auth('guest', 'guest')
                    .then(_res => {
                        res = _res;
                        res.should.have.status(200);
                        res.body.user.username.should.equal('guest');
                        res.body.user.should.include.keys(
                            'username', 'rides');
                    })
            });
        });

        describe('GET endpoint for user session', function() {

            it('should return user that is signed in', function() {
                let agent = chai.request.agent(app);
                return agent
                    .get('/users/login') // first have to log in
                    .auth('guest', 'guest')
                    .then(() => {
                        return agent.get('/users/me')
                            .then(res => {
                                res.should.have.status(200);
                                res.body.user.username.should.equal('guest');
                                res.body.user.should.include.keys(
                                    'username', 'rides');
                            })
                    });
            });
        });


        describe('GET endpoint to sign out', function() {

            it('should sign out the user and redirect', function() {
                let agent = chai.request.agent(app);
                return agent
                    .get('/users/login') // first have to log in
                    .auth('guest', 'guest')
                    .then(() => {
                        return agent.get('/users/logout')
                            .then(res => {
                                res.should.have.status(200);
                                res.redirects.should.have.lengthOf(1);
                            })
                    });
            });
        });



        describe('POST endpoint to create new user', function() {

            it('should create a new user', function() {

                let testUsername = 'guest1';
                let testPassword = 'guest1';

                return chai.request(app)
                    .post('/users/sign-up')
                    .send({username: testUsername, password: testPassword})
                    .then(res => {
                        res.should.have.status(201);
                        res.body.user.username.should.equal(testUsername);
                        res.body.user.should.include.keys(
                            'username', 'rides');
                        UserContact.findOne({username: testUsername})
                            .then(user => {
                                user.should.exist;
                                user.username.should.equal(testUsername);
                            })
                    })
            });
        });


        describe('POST endpoint to add a new rides entry', function() {

            it('should add a new ride entry', function() {
                let agent = chai.request.agent(app);
                let username = 'guest';
                let password = '$2a$10$5Pr8yrQmejJhdgh8wizpUedShkVc3rBI53gKKqUnaKgTEP6N3kkJC';
                let testEntry = {
                    userId:username,
                    rideDate: "20-Jul-2017",
                    stationFrom: "E40St&amp;5Ave",
                    stationTo: "NassauSt&amp;NavySt",
                    cost: "3,543.33",
                    paymentType: "Cash",
                    bikeType: "E-Bikes"
                };
                return agent
                    .get('/users/login') // first have to log in
                    .auth(username, password)
                    .then(() => {
                        return agent
                            .post('/rides/add')
                            .send(testEntry)
                            .then(res => {
                                res.should.have.status(201);
                            })
                            .then(() => {
                                return UserContact
                                    .findOne({userId: username})
                                    .then(user => {
                                        let newEntry = user.rides[0];

                                        // newEntry.rideDate.should.equal(testEntry.rideDate);
                                        newEntry.stationFrom.should.equal(testEntry.stationFrom);
                                        newEntry.stationTo.should.equal(testEntry.stationTo);
                                        newEntry.cost.should.equal(testEntry.cost);
                                        newEntry.paymentType.should.equal(testEntry.paymentType);
                                        newEntry.bikeType.should.equal(testEntry.bikeType);
                                    })
                            });
                    });
            });
        });





        describe('PUT endpoint to edit rides entry', function() {

            it('should save changes to the rides entry', function() {
                        let username = 'guest';
                        let password = 'guest';
                        let agent = chai.request.agent(app);
                        let testEntry = {
                            userId:username,
                            rideDate: "21-Jul-2017",
                            stationFrom: "E40St&amp;5Ave",
                            stationTo: "NassauSt&amp;NavySt",
                            cost: "3,543.331",
                            paymentType: "Credit",
                            bikeType: "E-Bikes"
                        };
                return agent
                    .get('/users/login') // first have to log in
                    .auth(username, password)
                    .then((res) => {

                        testEntry.id = res.body.user.rides[0]._id; // gets id of entry to change
                        return agent
                            .put('/rides/'+testEntry.id)
                            .send(testEntry)
                            .then(res => {

                                res.should.have.status(201);
                                return UserContact
                                    .findOne({userId: username})
                                    .then(user => {

                                        let resEntries = user.rides;
                                        let resEntry;
                                        resEntries.forEach((entry) => {
                                            console.log('entry is '+JSON.stringify(entry));
                                            if (entry._id == testEntry.id) {

                                                resEntry = entry; // finds updated entry in response
                                            }
                                        });

                                        //let entry = user.rides[0];
                                        resEntry.stationFrom.should.equal(testEntry.stationFrom);
                                        resEntry.stationTo.should.equal(testEntry.stationTo);
                                        resEntry.cost.should.equal(testEntry.cost);
                                        resEntry.paymentType.should.equal(testEntry.paymentType);
                                        resEntry.bikeType.should.equal(testEntry.bikeType);

                                    })
                            });
                    });
            });
        });


        describe('DELETE endpoint for user account', function() {

            it('should delete the user account', function() {
                let agent = chai.request.agent(app);
                return agent
                    .get('/users/login') // first have to log in
                    .auth('guest', 'guest')
                    .then(() => {
                        return agent
                            .delete('/users/me')
                            .then(res => {
                                res.should.have.status(200);
                                return UserContact
                                    .findOne({userId: 'guest'})
                                    .then(res => {
                                        should.not.exist(res);
                                    })
                            })
                    });
            });
        });


        describe('DELETE endpoint for rides entry', function() {

            it('should delete the ride entry', function() {
                let agent = chai.request.agent(app);
                return agent
                    .get('/users/login') // first have to log in
                    .auth('guest', 'guest')
                    .then((res) => {
                        let testEntry = res.body.user.rides[0];
                        return agent
                            .delete('/rides/'+testEntry.id)
                            .send({userId: 'guest'})
                            .then(res => {
                                // let resEntries = res.body.user.rides;
                                // let deletedEntry = null;
                                // resEntries.forEach((entry) => {
                                //     if (entry.id === testEntry.id) {
                                //         deletedEntry = entry;
                                //     }
                                // });
                                //
                                res.should.have.status(204);
                                // should.not.exist(deletedEntry);
                            })
                            .then (() => {
                                return UserContact
                                    .findOne({userId: 'guest'})
                                    .then(user => {
                                        let entries = user.rides;
                                        let deletedEntry = null;
                                        entries.forEach((entry) => {
                                            if (entry._id === testEntry.id) {
                                                deletedEntry = entry;
                                            }
                                        });
                                        should.not.exist(deletedEntry);
                                    });
                            });
                    });
            });
        });


    });

    //
