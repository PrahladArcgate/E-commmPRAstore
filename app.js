// const auth =require('./auth')
require('dotenv').config();
const express = require("express");
const app = express();
const session = require('express-session');
const passport =require("passport")
const path=require('path')
const bodyParser = require("body-parser");
const { pool } = require("./dbConfig");
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const encodeUrl = bodyParser.urlencoded({ extended: false });
const viewPath = path.join(__dirname,"./views") 

const initializePassport = require('./passportConfig')
initializePassport(passport)
var userProfile;
const GOOGLE_CLIENT_ID = 'our-google-client-id';
const GOOGLE_CLIENT_SECRET = 'our-google-client-secret';
const FacebookStrategy =require("passport-facebook").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const port = process.env.PORT || 5000
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize())
app.use(passport.session())
app.use(flash());
app.set("view engine", "ejs");
app.set("views",viewPath)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
passport.use(new FacebookStrategy({
  clientID: process.env.CLIENT_ID_FB,
  clientSecret: process.env.CLIENT_SECRET_FB,
  callbackURL: "http://localhost:5000/auth/facebook/"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
)); 
passport.use(new GoogleStrategy({
  
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost/5000/auth/google/"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/index');
  });

  app.get('/', (req, res) => {
    res.render("index");
});

app.get('/users/register', checkAuthenticated, (req, res) => {
    res.render("register")
});

app.get('/users/login', checkAuthenticated, (req, res) => {
    res.render("login")
});

app.get('/users/shop', checkNotAuthenticated, (req, res) => {
    res.render("shop", { user: req.user.name });
});

// app.get('users/logout', (req, res) => {
//     req.logOut();
//     req.flash("success_msg", "You have been logged out sir/ma'am")
//     res.redirect('/users/login')
// })

app.post('/users/register', async (req, res, next) => {
    let { name, email, password, password2 } = req.body;
    console.log({ name, email, password, password2 })
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({ message: "please enter all fields..." });
    }
    if (password.length < 6) {
        errors.push({ message: "Password should be atleast 6 characters long" });
    }
    if (password != password2) {
        errors.push({ message: "Password do not match" })
    }
    if (errors.length > 0) {
        res.render("register", { errors })
    }
    else {
        // form validation passed
        let hashedPass = await bcrypt.hash(password, 3);
        console.log(hashedPass)

        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [email],
            (err, results) => {
                if (err) {
                    console.error(err.stack)
                    throw err
                }
                console.log(results.rows)

                if (results.rows.length > 0) {
                    errors.push({ message: "Email already taken" })
                    res.render('register', { errors })
                }
                else {
                    pool.query(
                        `INSERT INTO users (name,email,password)
                        VALUES ($1,$2,$3)
                        RETURNING id,password`, [name, email, hashedPass],
                        (err, results) => {
                            if (err) {
                                console.log(err.stack)
                                throw err
                            }
                            console.log(results.rows);
                            req.flash("success_msg", "You my sir/ma'am are registered now. Please log in")
                            res.redirect('/users/login')
                        }
                    )
                }
            }
        );
    }
})

app.post("/users/login", passport.authenticate('local', {
    successRedirect: "/users/shop",
    failureRedirect: "/users/login",
    failureFlash: true
}))

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/users/shop')
    }
    next();
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/users/login')
}
app.get('/users/success', (req, res) => res.send(userProfile));
app.get('/users/error', (req, res) => res.send("error logging in"));
app.get("/users/detail", function (req, res) {
    res.render("detail");
  })  
app.get("/users/contact", function (req, res) {
    res.render("contact");
  }) 
app.get("/users/checkout", function (req, res) {
    res.render("checkout");
  })  
app.get("/users/index", function (req, res) {
    res.render("index");
  })  
app.get("/users/shop", function (req, res) {
    res.render("shop");
  })  

  app.get('/logout',  function (req, res, next)  {
    // If the user is loggedin
    if (req.session.loggedin) {
          req.session.loggedin = false;
          res.redirect('/');
    }else{
        // Not logged in
        res.redirect('/');
    }
});
app.listen(port, () => {
  console.log(`server is up on http://localhost:${port}`);
});


