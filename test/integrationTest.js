const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the should syntax available throughout
// this module
const should = chai.should();

const {UserDetail} = require('../models');
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

  for (let i=1; i<=10; i++) {
    seedData.push(generateUserData());
  }
  // this will return a promise
  return UserDetail.insertMany(seedData);
}

// generate an object represnting a restaurant.
// can be used to generate seed data for db
// or request.body data
function generateUserData() {
  return {
   
    title: faker.company.companyName(),
      name: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      gender:"Male",
    username: faker.name.firstName(),
    accountCode:faker.random.number(),
    ssn:faker.random.number()+"",
    acttype:"Saving",
    branchName:faker.company.companyName(),
    totalAmount:faker.random.number()+"",
email:faker.internet.email(),
address:{
    street:faker.address.streetName(),
    city:faker.address.city(),
    country:"USA",
    zipcode:faker.address.zipCode()
  },
    actopendate:faker.date.past()
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

describe('User API resource', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedUserData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedUserData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  })

  // note the use of nested `describe` blocks.
  // this allows us to make clearer, more discrete tests that focus
  // on proving something small
  describe('GET endpoint', function() {

    it('should return all existing users', function() {
      // strategy:
      //    1. get back all users returned by by GET request to `/users`
      //    2. prove res has right status, data type
      //    3. prove the number of users we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
      let res;
      return chai.request(app)
        .get('/users')
        .then(function(_res) {
          // so subsequent .then blocks can access resp obj.
          res = _res;
          res.should.have.status(200);
          res.body.users.should.be.a('array');
          res.body.users.should.have.length.of.at.least(1);
          console.log("UserDetail.count"+UserDetail.count());
          return UserDetail.count();

        })

        .then(function(count) {
          
          res.body.users.should.have.length.of(count);
        });
    });


    it('should return users with right fields', function() {
      // Strategy: Get back all users, and ensure they have expected keys

      let resPosts;
      return chai.request(app)
        .get('/users')
        .then(function(res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.users.should.be.a('array');
          res.body.users.should.have.length.of.at.least(1);
          res.body.users.forEach(function(users) {
            users.should.be.a('object');
            users.should.include.keys(
              'id', 'name', 'address', 'totalAmount','ssn');
          });
          resPosts = res.body.users[0];
          return UserDetail.findById(resPosts.id);
        })
        .then(function(users) {

          resPosts.id.should.equal(users.id);
          resPosts.ssn.should.equal(users.ssn);
          resPosts.name.should.equal(users.name.firstName+" "+users.name.lastName);
          resPosts.totalAmount.should.equal(users.totalAmount);
          
        });
    });
  });

  describe('POST endpoint', function() {
    // strategy: make a POST request with data,
    // then prove that the restaurant we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new users', function() {

      const newUser = generateUserData();
      
      return chai.request(app)
        .post('/users')
        .send(newUser)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'name','totalAmount','ssn');
         
          // cause Mongo should have created id on insertion
          res.body.totalAmount.should.not.be.null;
         res.body.name.should.equal(newUser.name.firstName+" "+newUser.name.lastName);
          return UserDetail.findById(res.body.id).exec();
        })
        .then(function(post) {
          post.ssn.should.equal(newUser.ssn);
          post.totalAmount.should.equal(newUser.totalAmount);
          post.name.firstName.should.equal(newUser.name.firstName);
          post.name.lastName.should.equal(newUser.name.lastName);
        });
    });
  });

  describe('PUT endpoint', function() {

    // strategy:
    //  1. Get an existing restaurant from db
    //  2. Make a PUT request to update that restaurant
    //  3. Prove restaurant returned by request contains data we sent
    //  4. Prove restaurant in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = {
        // acttype: 'Saving',
        // ssn:'13243',
        totalAmount:'10000'
      };

      return UserDetail
        .findOne()
        .exec()
        .then(function(post) {
          updateData.id = post.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/users/${post.id}`)
            .send(updateData);
        })
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
            'id', 'totalAmount');
          // res.body.acttype.should.equal(updateData.acttype);
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          // res.body.ssn.should.equal(updateData.ssn);
         //res.body.name.should.equal(updateData.name.firstName+" "+updateData.name.lastName);

           res.body.totalAmount.should.equal(updateData.totalAmount);

          return UserDetail.findById(updateData.id).exec();
        })
        .then(function(post) {
          // post.acttype.should.equal(updateData.acttype);
          // post.ssn.should.equal(updateData.ssn);
          post.totalAmount.should.equal(updateData.totalAmount);
          // post.name.firstName.should.equal(updateData.name.firstName);
          //post.name.lastName.should.equal(updateData.name.lastName);

        });
      });
  
});

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a user
    //  2. make a DELETE request for that user's id
    //  3. assert that response has right status code
    //  4. prove that user with the id doesn't exist in db anymore
    it('delete a userdetail by id', function() {
let userdetail;

      return UserDetail
        .findOne()
        .exec()
        .then(function(_user) {
          userdetail = _user;
          return chai.request(app).delete(`/users/${userdetail.id}`);
        })
      
        .then(function(res) {
          res.should.have.status(204);
          return UserDetail.findById(userdetail.id).exec();
        })
        .then(function(_user) {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_user.should.be.null` would raise
          // an error. `should.be.null(_user)` is how we can
          // make assertions about a null value.
          should.not.exist(_user);
        });
    });
  });
});
