const mongoose = require('mongoose');
// const {logExtended} = require('./logger');
const config = require('config');

const dbUri = process.env.NODE_ENV === 'development'
	? `mongodb://${config.dbDev.user}:${encodeURIComponent(config.dbDev.pass)}@${config.dbDev.hostString}${config.dbDev.name}`
	: `mongodb://${config.dbProd.user}:${encodeURIComponent(config.dbProd.pass)}@${config.dbProd.hostString}${config.dbProd.name}`;

// logExtended.info(`dbUri: ${dbUri}`);
console.log(`dbUri: ${dbUri}`);
mongoose.Promise = global.Promise;
mongoose.connect(dbUri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
	console.log(`Connected to DB on ${dbUri}`);
	// logExtended.info(`Connected to DB on ${dbUri}`);
});

module.exports = mongoose;