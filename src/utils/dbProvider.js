const mongoose = require('mongoose');
const log = require('./logger');
const config = require('config');

const dbUri = process.env.NODE_ENV === 'development'
	? `mongodb://${config.get('dbDev.user')}:${encodeURIComponent(config.get('dbDev.pass'))}@${config.get('dbDev.hostString')}${config.get('dbDev.name')}`
	: `mongodb://${config.get('dbProd.user')}:${encodeURIComponent(config.get('dbProd.pass'))}@${config.get('dbProd.hostString')}${config.get('dbProd.name')}`;

log.info(`dbUri :${dbUri}`);

mongoose.Promise = global.Promise;
mongoose.connect(dbUri, {
	useNewUrlParser: true,
	slave_ok: false
});
const db = mongoose.connection;

db.on('error', (error) => {
	log.error(`Connection error: ${error}`);
});

db.once('open', () => {
	log.info(`Connected to DB on ${dbUri}`);
});

module.exports = mongoose;
