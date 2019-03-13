const backup = require('mongodb-backup');
const restore = require('mongodb-restore');
const {log} = require('../utils/logger')(module);
const path = require('path');
const config = require('config');

const dbUri = process.env.NODE_ENV === 'development'
	? `mongodb://${config.get('dbDev.user')}:${encodeURIComponent(config.get('dbDev.pass'))}@${config.get('dbDev.hostString')}${config.get('dbDev.name')}`
	: `mongodb://${config.get('dbProd.user')}:${encodeURIComponent(config.get('dbProd.pass'))}@${config.get('dbProd.hostString')}${config.get('dbProd.name')}`;

const archivesPath = config.get('path.storagePath') || process.cwd();
const archivesDirectory = config.get('path.directory.archives') || 'archives';
const objectPath = path.join(archivesPath, archivesDirectory);

/**
 * Метод для сворачивания дампа.
 *
 * @returns {Promise<void>}
 */
async function exportBackup() {
	log.info('Начало архивирования БД');
	await backup({
		uri: dbUri,
		root: objectPath,
		callback: (error) => {
			if (error) {
				log.error(`exportBackup: ${error}`);
			} else {
				log.info('Закончилось архивирования БД');
			}
		}
	});
}

async function importBackup() {
	log.info('Начало востановление БД');
	await restore({
		uri: dbUri,
		root: objectPath,
		callback: (error) => {
			if (error) {
				log.error(`importBackup: ${error}`);
			} else {
				log.info('Закончилось востановление БД');
			}
		}
	});
}

module.exports = {
	exportBackup,
	importBackup
};