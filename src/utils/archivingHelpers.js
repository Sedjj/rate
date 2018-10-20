const zipper = require('zip-local');
const {deleteDir, makeDir} = require('./fsHelpers');

/**
 * Создаёт zip архив из директории и удаляет её.
 *
 * @param {String} dirPath путь к директории
 * @return {Promise}
 */
function makeZip(dirPath) {
	return new Promise((resolve, reject) => {
		zipper.zip(dirPath, (error, zipped) => {
			if (error) {
				reject(error);
			}
			
			zipped.compress();
			zipped.save(dirPath + '.zip', error => {
				if (error) {
					reject(error);
				}
				deleteDir(dirPath)
					.then(() => resolve())
					.catch(error => reject(error));
				
			});
		});
	});
}

/**
 * Извлекает из zip архива в директории и удаляет его.
 *
 * @param {String} dirPath путь к директории
 * @return {Promise}
 */
function makeUnzip(dirPath) {
	return new Promise((resolve, reject) => {
		zipper.unzip(dirPath + '.zip', (error, unzipped) => {
			if (error) {
				reject(error);
			}
			
			makeDir(dirPath)
				.then(() => {
					unzipped.save(dirPath, error => {
						if (error) {
							reject(error);
						}
						deleteDir(dirPath + '.zip')
							.then(() => resolve())
							.catch(error => reject(error));
					});
				})
				.catch(error => reject(error));
		});
	});
}

module.exports = {
	makeZip,
	makeUnzip
};