var Book = require("../models/book");
var User = require("../models/user");


// all middleware goes here
var middlewareobj = {};

middlewareobj.checkBookOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Book.findById(req.params.id, function(err, foundBook){
			if(err || !foundBook){
				req.flash("error", "Book not found");
				res.redirect("/books");
			}else{
				//does user own the Blog?
				if(foundBook.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				}else{
					req.flash("error", "You don't have permission to do that!");
					res.redirect("/books");
				}
			}
		});
	}else{
		req.flash("error", "You need to be loggedin to do that!");
		res.redirect("/books")
	}    
}


middlewareobj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to b loggin to do that!");
	res.redirect("/login");    
}


middlewareobj.isAdminTrue = function(req, res, next){
		User.findById(req.user._id, function(err, adminUser){
            //console.log(req.user.id);
            if(adminUser.isAdmin){
                return next();
                
            }else{
                req.flash("error", "You are not a admin!");
                res.redirect("/books");
            }
        });
}

middlewareobj.isPub = function(req, res, next){
		User.findById(req.user._id, function(err, foundUser){
            if(foundUser.canPub){
                return next();
            }else{
                req.flash("error", "Sorry you can't publish!");
                res.redirect("/books");
            }
        });
}

module.exports = middlewareobj;