var path = require('path'),
    rootPath = path.normalize(__dirname + '/../..');
var keys = rootPath + '/keys.txt';

module.exports = {
<<<<<<< HEAD
    root: rootPath,
    port: process.env.PORT || 3000,
    db: process.env.MONGOHQ_URL || 'mongodb://localhost:27017/izanami-cfh'
};
=======
	root: rootPath,
	port: process.env.PORT || 3000,
	db: process.env.MONGOHQ_URL
};
>>>>>>> 5b865fc8a36cd1ad11875092e7be2556196ee751
