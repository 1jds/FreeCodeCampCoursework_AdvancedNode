const express = require('express');
const app = express();
const passport = require('passport')
const bcrypt = require('bcrypt');

module.exports = function(app, myDataBase) {

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  // Be sure to change the title
  app.route('/').get((req, res) => {
    // Change the response to render the Pug template
    res.render('index', {
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true,
      title: 'Connected to Database now...',
      message: 'Please login'
    });
  });



  app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile') /////////////////////profile
    // redirect the user to /profile if the middleware passes

  });

  // app.post('/login/password',
  //   passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
  //   function(req, res) {
  //     res.redirect('/~' + req.user.username);
  //   });

  app.route('/register')
    .post((req, res, next) => {
      const hash = bcrypt.hashSync(req.body.password, 12);
      myDataBase.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
          next(err);
        } else if (user) {
          res.redirect('/');
        } else {
          myDataBase.insertOne({
            username: req.body.username,
            password: hash
          },
            (err, doc) => {
              if (err) {
                res.redirect('/');
              } else {
                // The inserted document is held within
                // the ops property of the doc
                next(null, doc.ops[0]);
              }
            }
          )
        }
      })
    },
      passport.authenticate('local', { failureRedirect: '/' }),
      (req, res, next) => {
        res.redirect('/profile');
      }
    );

  app.route('/profile')
    .get(ensureAuthenticated, (req, res) => {
      res.render('profile', { username: req.user.username })
    })

  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
    });

  app.get('/auth/github', passport.authenticate('github'))

  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    req.session.user_id = req.user.id
    res.redirect('/chat');
  })

  app.get('/chat', ensureAuthenticated, (req, res) => {
    res.render('chat', { user: req.user })
  })

}



