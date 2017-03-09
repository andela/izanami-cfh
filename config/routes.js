module.exports = (app, passport) => {
    // User Routes
  const users = require('../app/controllers/users'),
    customAuth = require('./middlewares/authorization.js');

  app.get('/signin', users.signin);
  app.get('/signup', users.signup);
  app.get('/chooseavatars', customAuth.hasAuth(), users.checkAvatar);
  app.get('/signout', users.signout);

    // Setting up the users api
  app.post('/users', users.create, passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), users.generateToken, users.returnToken);
  app.post('/users/avatars', users.avatars);

    // Donation Routes
  app.post('/donations', customAuth.hasAuth(), users.addDonation);

  app.post('/users/session', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password.'
  }), users.session);

    /*
        Endpoint for login. Passportsquthenticates user,
        JWT gets generated if valid user and then saves token in cookies
    */
  app.post('/api/auth/login', passport.authenticate('local', {
    session: false,
    failureRedirect: '/signin',
    failureFlash: 'Invalid email or password'
  }), users.generateToken, users.returnToken);

  app.get('/api/users/me', users.me);

  app.get('/users/me', customAuth.hasAuth(), users.me);
  app.get('/users/:userId', users.show);

    // Setting the facebook oauth routes
  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['email'],
    failureRedirect: '/signin'
  }), users.signin, users.generateToken, users.returnToken);

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/signin'
  }), users.generateToken, users.returnToken);

    // Setting the github oauth routes
  app.get('/auth/github', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), users.signin, users.generateToken, users.returnToken);

  app.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/signin'
  }), users.generateToken, users.returnToken);

    // Setting the twitter oauth routes
  app.get('/auth/twitter', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.signin, users.generateToken, users.returnToken);

  app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/signin'
  }), users.generateToken, users.returnToken);

    // Setting the google oauth routes
  app.get('/auth/google', passport.authenticate('google', {
    failureRedirect: '/signin',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }), users.signin, users.generateToken, users.returnToken);

  app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/signin'
  }), users.generateToken, users.returnToken);

    // Finish with setting up the userId param
  app.param('userId', users.user);

    // Answer Routes
  const answers = require('../app/controllers/answers');

  app.get('/answers', answers.all);
  app.get('/answers/:answerId', answers.show);
    // Finish with setting up the answerId param
  app.param('answerId', answers.answer);

    // Question Routes
  const questions = require('../app/controllers/questions');

  app.get('/questions', questions.all);
  app.get('/questions/:questionId', questions.show);
    // Finish with setting up the questionId param
  app.param('questionId', questions.question);

    // Avatar Routes
  const avatars = require('../app/controllers/avatars');

  app.get('/avatars', avatars.allJSON);

    // Home route
  const index = require('../app/controllers/index');
  app.get('/play', index.play);

  app.get('/', customAuth.hasAuth(), index.render);
};
