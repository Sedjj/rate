const mongoose = require('mongoose');
// const {logExtended} = require('./logger');
const config = require('config');

const dbUri = process.env.NODE_ENV === 'development'
	? `mongodb://${config.dbDev.user}:${encodeURIComponent(config.dbDev.pass)}@${config.dbDev.hostString}${config.dbDev.name}`
	: `mongodb://${config.dbProd.user}:${encodeURIComponent(config.dbProd.pass)}@${config.dbProd.hostString}${config.dbProd.name}`;

// logExtended.info(`dbUri: ${dbUri}`);

mongoose.Promise = global.Promise;
mongoose.connect(dbUri, {
	useNewUrlParser: true
});

const db = mongoose.connection;

db.on('error', (error) => {
	// logExtended.error(`Connection error: ${error}`);
});

db.once('open', () => {
	// logExtended.info(`Connected to DB on ${dbUri}`);
});

module.exports = mongoose;