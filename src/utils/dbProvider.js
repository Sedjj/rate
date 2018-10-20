const mongoose = require('mongoose');
const log = require('./logger');
const config = require('config');

const dbUri = process.env.NODE_ENV === 'development'
	? `mongodb://${config.get('dbDev.user')}:${encodeURIComponent(config.get('dbDev.pass'))}@${config.get('dbDev.hostString')}${config.get('dbDev.name')}`
	: `mongodb://${config.get('dbProd.user')}:${encodeURIComponent(config.get('dbProd.pass'))}@${config.get('dbProd.hostString')}${config.get('dbProd.name')}`;

mongoose.Promise = global.Promise;
mongoose.connect(dbUri, {
	useNewUrlParser: true
});
const db = mongoose.connection;

db.on('error', function (error) {
	log.error('Connection error:', error.message);
});

db.once('open', function callback() {
	log.info(`Connected to DB on ${dbUri}`);
});

module.exports = mongoose;
