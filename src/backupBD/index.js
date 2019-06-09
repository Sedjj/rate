const {mongoimport} = require('../../vendor/mongopack');
const {log} = require('../utils/logger');
const path = require('path');
const config = require('config');
const {sendFile} = require('../telegram/api');
const {readFileToStream} = require('../utils/fsHelpers');
const exec = require('child_process').exec;

const database = process.env.NODE_ENV === 'development'
	? config.dbDev.name
	: config.dbProd.name;

const dbUri = process.env.NODE_ENV === 'development'
	? `mongodb://${config.dbDev.user}:${encodeURIComponent(config.dbDev.pass)}@${config.dbDev.hostString}${config.dbDev.name}`
	: `mongodb://${config.dbProd.user}:${encodeURIComponent(config.dbProd.pass)}@${config.dbProd.hostString}${config.dbProd.name}`;

const archivesPath = config.path.storagePath || process.cwd();
const archivesDirectory = config.path.directory.upload || 'upload';
const objectPath = path.join(archivesPath, archivesDirectory);

const options = {
	type: 'json', // default is csv
	pretty: true, // gives a pretty formatted json in output file
};

/**
 * Метод для сворачивания дампа.
 *
 * @param {String} collection название коллекции
 * @returns {Promise<void>}
 */
function exportBackup(collection) {
	if (!collection) {
		return;
	}
	log.info('Начало архивирования БД');
	const command = `mongodb-backup ${dbUri} -c '["${collection}"]' -p json -o ${path.join(objectPath, `${collection}.json`)}`;
	log.info(command);
	execShell(command)
		.then((error) => {
			if (error) {
				log.error(`exportBackup: ${error}`);
				throw new Error();
			}
			log.info('Закончилось архивирования БД');
			readFileToStream(path.join(objectPath, `${collection}.json`))
				.then((stream) => {
					sendFile(stream);
					log.debug('Файл statistic отправлен');
				});
		})
		.catch((error) => {
			log.error(`Упал метод exportBackup - ${error} - для: ${collection.toString()}`);
		});
}

/**
 * Метод для разворачивания коллекции.
 *
 * @param {String} collection название коллекции
 * @returns {Promise<void>}
 */
function importBackup(collection) {
	if (!collection) {
		return;
	}
	log.info('Начало востановление БД');
	mongoimport(database, collection, path.join(objectPath, `${collection}.json`), options)
		.then((error) => {
			if (error) {
				log.error(`importBackup: ${error}`);
				throw new Error();
			}
			log.info('Закончилось востановление БД');
		})
		.catch((error) => {
			log.error(`Упал метод importBackup - ${error} - для: ${collection.toString()}`);
		});
}

/**
 * Функция выполнения shell команд.
 *
 * @param {String} cmd команда для выполнения
 * @returns {Promise<any>}
 */
function execShell(cmd) {
	return new Promise((resolve, reject) => {
		exec(cmd, (error, stdout) => {
			if (error !== undefined && error !== null) {
				reject(error.message);
			}
			resolve(stdout);
		});
	});
}

module.exports = {
	exportBackup,
	importBackup
};