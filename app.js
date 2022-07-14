var bodyParser = require("body-parser"),
	methodOverride = require("method-override"),
	expressSanitizer = require("express-sanitizer"),
	express = require("express"),
	app = express(),
	mongoose = require("mongoose"),
	passport = require("passport"),
	localStratagy = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	User = require("./models/user"),
	Query = require("./models/Query"),
	flash = require('connect-flash'),
	connectDB = require('./db')
	const fs = require('fs');
var crypto = require('crypto');
var mysql = require('mysql');
var logged = false;
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "world"
});
var ssn ;


connectDB();

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(expressSanitizer());


//Passport config

app.use(require("express-session")({
	secret: "dancing cat",
	resave: false,
	saveUninitialized: false
}))
// flash
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));

// replace table name slots <-> queries

passport.use('local', new localStratagy({

  usernameField: 'username',

  passwordField: 'password',

  passReqToCallback: true //passback entire req to call back
} , function (req, username, password, done){


      if(!username || !password ) { return done(null, false, req.flash('message','All fields are required.')); }

      var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';

      con.query("select * from ccusers where id = ?", [username], function(err, rows){

        if (err) return done(req.flash('message',err));

        if(!rows.length){ return done(null, false, req.flash('message','Invalid username or password.')); }

        salt = salt+''+password;

        var encPassword = crypto.createHash('sha1').update(salt).digest('hex');

        var dbPassword  = rows[0].password;

        if(!(dbPassword == encPassword)){

            return done(null, false, req.flash('message','Invalid username or password.'));

         }
		ssn= rows[0].name;
        return done(null, rows[0]);

      });

    }

));
passport.serializeUser(function(user, done){

    done(null, user.id);

});

passport.deserializeUser(function(id, done){

    con.query("select * from ccusers where id = ?",[id], function (err, rows){
        done(err, rows[0]);
    });

});

app.use(function (req, res, next) {
	res.locals.currentUser = ssn;
	next();
});

//=========================================


//Auth routes

//register route
app.get("/register", (req, res) => {
	res.locals.message = '';
	res.render("register",{ message: req.flash("message","") });
});

app.post("/register", (req, res) => {

	var usr = req.body.username;
	var psw = req.body.password;
	var nam = req.body.showname;
	query_string = 'select * from ccusers where id = "'+usr+'"';
  con.query(query_string, function (err, result) {
    if (err) throw err;
	if (result.length>0){
		res.locals.message = 'User already exists';
		res.render("register");
	}
	else {
	var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
	salt = salt+''+psw;
	var encPassword = crypto.createHash('sha1').update(salt).digest('hex');
	query_string = 'insert into ccusers values ("'+usr+'","'+encPassword+'","'+nam+'")';
  con.query(query_string, function (err, result) {
    if (err) throw err;
  });
	res.locals.message = 'User added successfully';
  	res.render('register');
	}
  });

});



//login routes
app.get("/login", (req, res) => {
	res.render("login1",	{ message: req.flash("message") });
});


app.post("/login", passport.authenticate('local', {

    successRedirect: '/admin',

    failureRedirect: '/login',

    failureFlash: true

}), function(req, res, info){

    res.render('login1',{'message' :req.flash('message')});

});


//logout routes
app.get("/logout", (req, res) => {
	req.logout();
	ssn = '';
	res.redirect('/login');
});


//=========================Routes============================//



app.get("/gallery", (req, res) => {
	res.sendFile('/GALLERY/index.html',{ root: app.get('views') })
})


app.get("/debsoc", (req, res) => {
	res.render('DEBSOC/index',{ root: app.get('views') })
	  req.session.current_url = '/debsoc'
})

app.get("/addiction", (req, res) => {
	res.sendFile('/ADDICTION/index.html',{ root: app.get('views') })
})


// Art-circle Routes
app.get("/art-circle", (req, res) => {
	res.render("home", { message: req.flash('message') });
	  req.session.current_url = '/art-circle'
});

//admin page
app.get('/admin', isLoggedIn, (req, res) => {
		
  query_string = 'select * from queries';

  con.query(query_string, function (err, result) {
    if (err) throw err;
		res.render('admin', {queries: result});
  });

})


//post route for query page
//add article submit request
// replace table name slots <-> queries
app.post('/admin', (req, res) => {
	let query = new Query();
	query.Name = req.body.Name;
	query.Email = req.body.Email;
	query.Subject = req.body.Subject;
	query.Message = req.body.Message;
	query.Club = req.body.club
	query_string = 'insert into queries values ("'+query.Name+'","'+query.Email+'","'+query.Subject+'","'+query.Message+'","'+query.Club+'",now(6))';
	
  con.query(query_string, function (err, result) {
    if (err) throw err;
  });
	req.flash('message', 'Your response has been submitted');
	res.redirect('/contact');
})

app.get('/contact', (req, res) => {
	res.render('partials/contact', { message: req.flash('message') });
	req.session.current_url = '/contact'
})

/*
app.get('/home', (req, res) => {
	res.sendFile('/ECA/index.html',{ root: app.get('views') })
})
*/
app.get('/home', (req, res) => {
	res.render('ECA/index',{ root: app.get('views') })
	req.session.current_url = '/home'
})


app.listen(3000, 'localhost', () => {
	console.log(`The blog server started at localhost`);
});


//middleware to check if it is authenticated
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}