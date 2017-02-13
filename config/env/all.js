var path = require('path'),
rootPath = path.normalize(__dirname + '/../..');
var keys = rootPath + '/keys.txt';

module.exports = {
	root: rootPath,
	port: process.env.PORT || 3000,
    db: `mongodb://freemile:Kratus043@ds151279.mlab.com:51279/card4human`
};
