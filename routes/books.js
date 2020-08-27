var express = require("express");
var router  = express.Router();
var Books = require("../models/book");
var middleware = require("../middleware");

//INDEX ALL BOOKS
router.get("/", function(req, res){
	//get all campgrounds from db
	Books.find({}, function(err, allBooks){
		if(err){
			console.log(err);
		}else{
			res.render("books/index", {books: allBooks});
		}
	})
});

//create
router.post("/",middleware.isLoggedIn, middleware.isPub, function(req, res){
	// get data from form and add to books array
	var title = req.body.title;
	var price = req.body.price;
	var img = req.body.image;
    var desc = req.body.description;
    var doc = req.body.doc;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newBook = {name: title, coverImage: img, description: desc, author: author, price: price, doc: doc};
	//Create a new book and save to db
	Books.create(newBook, function(err, newlyCreated){
		if(err){
			console.log(err);
		}else{
			//redirect back to campgrounds
			res.redirect("/books");
		}
	});
});

//New route
router.get("/new",middleware.isLoggedIn, middleware.isPub, function(req, res){
	res.render("books/new")
});

//SHOWS MORE INFO ABOUT ONE BOOK
router.get("/:id", function(req, res){
	//find the books with provided id
	Books.findById(req.params.id, function(err, foundBook){
		if(err || !foundBook){
			req.flash("error", "book not found!");
			res.redirect("back");
		}else{
			//RENDER SHOW TEMPLATE WITH THAT BOOK
			res.render("books/show", {book: foundBook});
		}
	})
	
});

//EDIT BOOKS ROUTE
router.get("/:id/edit", middleware.checkBookOwnership, function(req, res){

	Books.findById(req.params.id, function(err, foundBook){
		if(err || !foundBook){
			req.flash("error", "Book not found");
			res.redirect("/books");
		}else{
			res.render("books/edit", {book: foundBook});	
		}
	});
});

//UPDATE BOOKS ROUTE
router.put("/:id", middleware.checkBookOwnership, function(req, res){
	//find and update the correct book
	Books.findByIdAndUpdate(req.params.id, req.body.book, function(err, updateBook){
		if(err){
			console.log(err);
			res.redirect("/books");
		}else{
			res.redirect("/books/"+ req.params.id);
		}
	});
	//redirect show page
});

//DESTROY BOOK ROUTE
router.delete("/:id", middleware.checkBookOwnership, function(req, res){
	Books.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			res.redirect("/books");
		}else{
			res.redirect("/books");
		}
	})
});




module.exports = router;