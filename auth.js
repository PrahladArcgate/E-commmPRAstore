// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// const GOOGLE_CLIENT_ID = 'our-google-client-id';
// const GOOGLE_CLIENT_SECRET = 'our-google-client-secret';

// app.use(passport.initialize());

// app.use(passport.session());


// passport.use(new GoogleStrategy({
//     clientID: GOOGLE_CLIENT_ID,
//     clientSecret: GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:5000/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//       userProfile=profile;
//       return done(null, userProfile);
//   }
// ));
 
// app.get('/auth/google', 
//   passport.authenticate('google', { scope : ['profile', 'email'] }));
 
// app.get('/auth/google/callback', 
//   passport.Authenticator('google', { failureRedirect: '/error' }),
//   function(req, res) {
//     // Successful authentication, redirect success.
//     res.redirect('/success');
//   });
//  passport.serializeUser(function(user, cb) {
//     cb(null, user);
//   });
  
//  passport.deserializeUser(function(obj, cb) {
//     cb(null, obj);
//   });
//   module.exports ='auth';