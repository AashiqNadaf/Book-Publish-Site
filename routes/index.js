var express		= require("express");
router  		= express.Router(),
passport 		= require("passport"),
User 			= require("../models/user"),
async 			= require("async"),
nodemailer		= require("nodemailer"),
crypto			= require("crypto"),
middlewareobj 	= require("../middleware");

//root route
router.get("/", function(req, res){
	res.redirect("/books");
});


router.get("/imgInfo", function(req, res){
	res.render("imageInfo");
});

//MAILGUN
var api_key = '***********************';
var domain = '*********************************************';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
 


//=====================================
//AUTH ROUTES
//=====================================

//show register form route
router.get("/register", function(req, res){
	res.render("register");
});


//handle signup form
router.post("/register", function(req, res){
	var newUser = new User({
		username: req.body.username,
		email: req.body.email,
		fullName: req.body.fullname,
		profPic: req.body.image
	});
	if(req.body.adminCode === "secretcode123"){
		newUser.isAdmin = true;
	}
	
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {"error": err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome "+user.username);
            res.redirect("/books");
        });
    });
	
});

//show login form
router.get("/login", function(req, res){
	res.render("login");
});

//handling login logic
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/books",
		failureRedirect: "/login"
	}), function(req, res){
});

//logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged out!");
	res.redirect("/books");
});

//forgot password
router.get("/forgot", function(req, res){
	res.render("forgot");
});

router.post("/forgot", function(req, res, next){
	async.waterfall([
		function(done){
			crypto.randomBytes(20, function(err, buff){
				var token = buff.toString('hex');
				done(err, token);
			});
		},
		function(token, done){
			User.findOne({email: req.body.email}, function(err, user){
				if(!user){
					req.flash("error", "No account with that email exist!");
					return res.redirect("/forgot");
				}
				user.resetPasswordToken = token;

				user.save(function(err){
					done(err, token, user);
				});
			});
		},
		function(token, user, done){

			var data = {
				from: 'Aashiq <mailblogmproj@gmail.com>',
				to: user.email,
				subject: 'Password Reset',
				text: "You are receiving this because you (or someone else) have requested the reset of the password.\n"+
				"Please click on the following link, or paste this into your browser to complete the process.\n"+
				"http://"+ req.headers.host + "/reset/"+ token +"\n\n"+
				"If you did not request this please ignore this email and your password will ramin unchanged."
			  };
			   
			  mailgun.messages().send(data, function (error, body) {
				req.flash("success", "An e-mail has been sent to "+user.email+" with further instructions!");
				done(error, "done");
			  });
		}
	], function(err){
		if(err){
			return next(err);
		}else{
			res.redirect("/forgot");
		}
	});
});

router.get("/reset/:token", function(req, res){
	User.findOne({resetPasswordToken: req.params.token}, function(err, user){
		if(!user){
			req.flash("error", "Password reset token is invalid or has expired.");
			return res.redirect("/forgot");
		}
		res.render("reset", {token: req.params.token});
	});
});

router.post("/reset/:token", function(req, res){
	async.waterfall([
		function(done){
			User.findOne({resetPasswordToken: req.params.token}, function(err, user){
				if(!user){
					req.flash("error", "Password reset token is invalid or has expired.");
					return res.redirect("/forgot");
				}
				if(req.body.password === req.body.confirm){
					user.setPassword(req.body.password, function(err){
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						user.save(function(err){
							req.logIn(user, function(err){
								done(err, user);
							});
						});
					});
				} else {
					req.flash("error", "Password do not match");
					return res.redirect("back");
				}
			});
		},
		function(user, done){
			req.flash("success", "Success! Your password has been changed.");
			done("done");

		}
	], function(err){
		res.redirect("/books");
	});
});

router.get("/admin", middlewareobj.isLoggedIn, middlewareobj.isAdminTrue, function(req, res){
	User.find({}, function(err, allUser){
		if(err){
			req.flash("error", "Something went wrong!");
			res.redirect("/books");
		}else{
			req.flash("success", "Hi Admin");
			res.render("admin", {aUser: allUser});
		}
	});
});

router.delete("/admin/:user_id", middlewareobj.isLoggedIn, middlewareobj.isAdminTrue, function(req, res){
	User.findByIdAndRemove(req.params.user_id, function(err){
		if(err){
			req.flash("error", "Something went wrong, User "+ req.params.username +" cannot be deleted!");
			res.redirect("/admin");
		}else{
			req.flash("success", "user deleted successfully");
			res.redirect("/admin");
		}
	});
});

router.post("/admin/:user_id/cantpub", middlewareobj.isLoggedIn, middlewareobj.isAdminTrue, function(req, res){
	User.findByIdAndUpdate(req.params.user_id,{canPub: false}, function(err){
		if(err){
			req.flash("error", "Something went wrong, User "+ req.params.username +" cannot be deleted!");
			res.redirect("/admin");
		}else{
			req.flash("success", "user info updated successfully");
			res.redirect("/admin");
		}
	});
});

router.post("/admin/:user_id/canpub", middlewareobj.isLoggedIn, middlewareobj.isAdminTrue, function(req, res){
	User.findByIdAndUpdate(req.params.user_id,{canPub: true}, function(err){
		if(err){
			req.flash("error", "Something went wrong, User "+ req.params.username +" cannot be deleted!");
			res.redirect("/admin");
		}else{
			req.flash("success", "user info updated successfully");
			res.redirect("/admin");
		}
	});
});


module.exports = router;