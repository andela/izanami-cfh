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


exports.hasAuth = (req, res, next) => {
  if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
  }
 
  console.log(localStorage.getItem('myToken'));
  if (req.user.token) {
    console.log(req.user.token, 'Token in authentication');
    next();
  } else {
    console.log('No token');
    next();
  }
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