/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.send(401, 'User is not authorized');
    }
    next();
};

/**
 * User authorizations routing middleware
 */
exports.user = {
    hasAuthorization: function(req, res, next) {
        if (req.profile.id != req.user.id) {
            return res.send(401, 'User is not authorized');
        }
        next();
    }
};

const expressJwt = require('express-jwt');
const authenticate = expressJwt({secret : process.env.SECRET_KEY,
                                getToken : function fromHeaderOrQueryString(req){
                                  
                                  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                                    return req.headers.authorization.split(' ')[1];
                                  } else if (req.cookies && req.cookies.token) {
                                    
                                    return req.cookies.token;
                                  }
                                  return null;
                                }});
  
const compose = require('composable-middleware');


exports.hasAuth = () => {
  return compose()
  .use((req, res, next) => {
    authenticate(req, res, next);
  })
  .use((err, req, res, next) => {
    if(err) {
      if (req.route.path === '/') {
        next();
      } else {
        res.redirect('/#!/signin?error=invalid');
      }
    }
  });
}

/**
 * Article authorizations routing middleware
 */
// exports.article = {
//     hasAuthorization: function(req, res, next) {
//         if (req.article.user.id != req.user.id) {
//             return res.send(401, 'User is not authorized');
//         }
//         next();
//     }
// };