var path = require('path'),
rootPath = path.normalize(__dirname + '/../..');
var keys = rootPath + '/keys.txt';

module.exports = {
	root: rootPath,
	port: process.env.PORT || 3000,
	db: 'mongodb://iampikuda:unlock@ds151289.mlab.com:51289/izanamiteam'
};


    // db: process.env.MONGOHQ_URL