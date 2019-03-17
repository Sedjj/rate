const mongoose = require('mongoose');
const {log} = require('./logger');
const config = require('config');

const dbUri = process.env.NODE_ENV === 'development'
	? `mongodb://${config.dbDev.user}:${encodeURIComponent(config.dbDev.pass)}@${config.dbDev.hostString}${config.dbDev.name}`
	: `mongodb://${config.dbProd.user}:${encodeURIComponent(config.dbProd.pass)}@${config.dbProd.hostString}${config.dbProd.name}`;

log.info(`dbUri: ${dbUri}`);

mongoose.Promise = global.Promise;
mongoose.connect(dbUri, {
	useNewUrlParser: true
});

const db = mongoose.connection;

db.on('error', (error) => {
	log.error(`Connection error: ${error}`);
});

db.once('open', () => {
	log.info(`Connected to DB on ${dbUri}`);
});

module.exports = mongoose;