var mongoose = require("mongoose");
var psl = require('passport-local-mongoose');
mongoose.connect('mongodb://localhost/gmailappppp').then(function () {
  console.log("connected !");
})
var userSchema = mongoose.Schema({
  username: String,
  password: String,
  name: String,
  gender: String,
  ProfilePic:{
    type:String,
    default:"def.jpg"
  },
  mobile: String,
  email: [{
    type: String,
    unique: true
  }],
  sentMails: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mail'
  }],
  recievedMails: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mail'
  }]
})
userSchema.plugin(psl);
module.exports = mongoose.model('user', userSchema);