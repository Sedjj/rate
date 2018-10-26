const mongoexport = require('../vendor/mongopack/index').mongoexport;
const mongoimport = require('../vendor/mongopack/index').mongoimport;
const log = require('../utils/logger')(module);
const path = require('path');
const config = require('config');

const database = process.env.NODE_ENV === 'development'
	? config.get('dbDev.name')
	: config.get('dbProd.name');

const archivesPath = config.get('path.storagePath') || process.cwd();
const archivesDirectory = config.get('path.directory.archives') || 'archives';
const objectPath = path.join(archivesPath, archivesDirectory);

async function exportBackup() {
	log.debug('Начало архивирования БД');
	const options = {
		type: 'json',
		pretty: false
	};
	options.query = '';
	await mongoexport(database, 'plans', path.join(objectPath, 'plans.json'), options);
}

async function importBackup() {
	log.debug('Начало востановление БД');
	const options = {
		type: 'json',
		pretty: false
	};
	await mongoimport(database, 'plans', path.join(objectPath, 'plans.json'), options);
}

module.exports = {
	exportBackup,
	importBackup
};