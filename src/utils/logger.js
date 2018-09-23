const winston = require('winston');

const options = {
	file: {
		level: 'info',
		filename: process.cwd() + '/logs/all.log',
		handleExceptions: true,
		json: true,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		colorize: false,
	},
	console: {
		level: 'debug',
		handleExceptions: true,
		json: false,
		colorize: true,
	},
};

/**
 * Обертка над логером.
 *
 * @param module
 * @returns {*}
 */
const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		new winston.transports.File({filename: 'error.log', level: 'error'}),
		new winston.transports.File({filename: 'combined.log'})
	]
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
	write: function (message, encoding) {
		// use the 'info' log level so the output will be picked up by both transports (file and console)
		logger.info(message);
	},
};

module.exports = logger;