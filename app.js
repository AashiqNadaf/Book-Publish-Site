var express	 		= require("express"),
app 				= express(),
bodyParser 			= require("body-parser"),
mongoose			= require("mongoose"),
expressSanitizer 	= require("express-sanitizer"),
Book				= require("./models/book"),
methodOveride		= require("method-override"),
flash				= require("connect-flash"),
User				= require("./models/user"),
async				= require("async"),
nodemailer			= require("nodemailer"),
crypto				= require("crypto"),
passport			= require("passport"),
LocalStrategy 		= require("passport-local");

var bookRoutes 	= require("./routes/books"),
indexRoutes			= require("./routes/index");

mongoose.connect("mongodb://localhost/book_publish");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOveride("_method"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(flash());

//PASSPORT CONFIGRATION
app.use(require("express-session")({
	secret: "Books Publish",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use("/books", bookRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
	console.log("BOOK Server has Started!!");
});