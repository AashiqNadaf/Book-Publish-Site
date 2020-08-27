var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSChema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    email:  {type: String, unique: true, required: true},
    fullName: String,
    profPic: String,
    isAdmin: { type: Boolean, default: false },
    canPub: {type: Boolean, default: true},
    resetPasswordToken: String
});

UserSChema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSChema);