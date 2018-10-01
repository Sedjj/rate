const mongoose = require('mongoose');
const log = require('./logger');
const config = require('config');

const dbUri = config.get('db.uri');
mongoose.Promise = global.Promise;
mongoose.connect(dbUri, {
	useNewUrlParser: true
});
const db = mongoose.connection;

db.on('error', function (err) {
	log.error('Connection error:', err.message);
});

db.once('open', function callback() {
	log.info(`Connected to DB on ${dbUri}`);
});

module.exports = mongoose;
