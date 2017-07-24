const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const moment = require('moment');
mongoose.Promise = global.Promise;

// this is our schema to represent a user


// note that all instance methods and virtual properties on our
// schema must be defined *before* we make the call to `.model`.


const  userContacts = mongoose.Schema({
   userId: {type: String,
    required: true,
    unique: true},
    password: {
    type: String,
    required: true
  }

});

userContacts.methods.apiRepr = function() {
  return {
    username: this.userId 
  };
}

userContacts.methods.validatePassword = function(password) {
  console.log("Inside password validation")
  console.log(" password is "+password);
  console.log(" this.password is "+this.password);
  console.log(" compare is "+bcrypt.compare(password, this.password));
  return bcrypt.compare(password, this.password);
}

userContacts.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
}

const UserContact = mongoose.model('UserContact', userContacts,'userContacts');

module.exports = {UserContact};
