var path = require('path'),
rootPath = path.normalize(__dirname + '/../..');
var keys = rootPath + '/keys.txt';

module.exports = {
	root: rootPath,
	port: process.env.PORT || 3000,
    db: process.env.MONGOHQ_URL || "mongodb://izanami:izanami@ds151289.mlab.com:51289/izanami_staging"
};