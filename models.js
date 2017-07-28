const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const moment = require('moment');
mongoose.Promise = global.Promise;

// this is our schema to represent a user

const  ridesSchema = mongoose.Schema({

    rideDate: {type: String},
    stationFrom: {type: String},
    stationTo: {type: String},
    cost: {type: String},
    paymentType:{type: String},
    bikeType:{type: String}

});

ridesSchema.methods.apiRepr = function() {

    return {
        id: this._id,
        rideDate: this.rideDate,
        stationFrom: this.stationFrom,
        stationTo: this.stationTo,
        cost:this.cost,
        paymentType:this.paymentType,
        bikeType: this.bikeType
    };
}

const RideDetail = mongoose.model('RideDetail', ridesSchema,'rideDetails');
// note that all instance methods and virtual properties on our
// schema must be defined *before* we make the call to `.model`.


const  userContacts = mongoose.Schema({
   userId: {type: String,
    required: true,
    unique: true},
    password: {
    type: String,
    required: true
  },
    rides:[ridesSchema]

});

userContacts.methods.apiRepr = function() {
  return {
    username: this.userId,
      rides: this.rides
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

module.exports = {RideDetail,UserContact};
