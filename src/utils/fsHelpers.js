const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
/*const mkdirp = require('mkdirp');
const rimraf = require('rimraf');*/

/**
 * Promise-версия метода mkdirp
 *
 * @param {String} directory путь к директории
 * @returns {Promise}
 */
/*function makeDir(directory) {
	return new Promise((resolve, reject) => {
		mkdirp(directory, error => {
			if (error) {
				reject(error);
			} else {
				resolve(directory);
			}
		});
	});
}*/

/**
 * Promise-версия метода rimraf
 *
 * @param {String} directory путь к директории
 * @returns {Promise}
 */
/*function deleteDir(directory) {
	return new Promise((resolve, reject) => {
		rimraf(directory, error => {
			if (error) {
				reject(error);
			} else {
				resolve(directory);
			}
		});
	});
}*/

/**
 * Генерирует рандомное имя файла
 *
 * @param {String} directory путь к файлу
 * @param {String} extension расширение файла
 * @returns {Promise}
 */
function generateName(directory, extension = null) {
	return new Promise((resolve, reject) => {
		crypto.pseudoRandomBytes(16, (error, buffer) => {
			if (error) {
				reject(error);
			} else {
				resolve(path.join(directory, buffer.toString('hex') + (extension ? '.' + extension : '')));
			}
		});
	});
}

/**
 * Сохраняет buffer в файл
 *
 * @param {String} filePath путь к файлу
 * @param {{statistics: Array} | never} buffer массив байтов
 * @returns {Promise}
 */
function saveBufferToFile(filePath, buffer) {
	return new Promise((resolve, reject) => {
		const writeStream = fs.createWriteStream(filePath);
		writeStream.write(buffer, error => {
			if (error) {
				reject(error);
			} else {
				resolve(filePath);
			}
			writeStream.end();
		});
	});
}

/**
 * Считывает файл в stream
 *
 * @param {String} filePath путь к файлу
 * @returns {Promise}
 */
function readFileToStream(filePath) {
	return new Promise((resolve, reject) => {
		const readStream = fs.createReadStream(filePath);
		readStream.on('error', err => {
			reject(err);
		});
		resolve(readStream);
	});
}

/**
 * Удаляет файл
 *
 * @param {String} filePath путь к файлу
 * @returns {Promise}
 */
function deleteFile(filePath) {
	return new Promise((resolve, reject) => {
		fs.unlink(filePath, error => {
			if (error) {
				reject(error);
			} else {
				resolve(filePath);
			}
		});
	});
}

/**
 * Перемещает файл
 *
 * @returns {Promise}
 * @param {String} oldPath текущий путь к файлу
 * @param {String} newPath путь к файлу, куда нужно переместить
 */
function moveFile(oldPath, newPath) {
	return new Promise((resolve, reject) => {
		fs.rename(oldPath, newPath, error => {
			if (error) {
				reject(error);
			} else {
				resolve(newPath);
			}
		});
	});
}

/**
 * Копирует файл
 *
 * @returns {Promise}
 * @param {String} oldPath текущий путь к файлу
 * @param {String} newPath новый путь к файлу
 */
function copyFile(oldPath, newPath) {
	return new Promise((resolve, reject) => {
		fs.copyFile(oldPath, newPath, error => {
			if (error) {
				reject(error);
			} else {
				resolve(newPath);
			}
		});
	});
}

/**
 * Считывает файл
 *
 * @param {String} filePath путь к файлу
 * @returns {Promise}
 */
function readFile(filePath) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, (error, file) => {
			if (error) {
				reject(error);
			} else {
				resolve(file);
			}
		});
	});
}

/**
 * Проверяет существует ли файл
 *
 * @param {String} filePath путь к файлу
 * @return {Promise}
 */
function checkFileExists(filePath) {
	return new Promise((resolve, reject) => {
		fs.access(filePath, fs.F_OK, error => {
			if (error) {
				reject(error);
			} else {
				resolve(filePath);
			}
		});
	});
}

module.exports = {
	generateName,
	saveBufferToFile,
	readFileToStream,
	deleteFile,
	moveFile,
	copyFile,
	readFile,
	checkFileExists
};
