const {createLogger, transports, format} = require('winston');

const options = {
	fileInfo: {
		level: 'info',
		filename: process.cwd() + '/logs/all.log',
		handleExceptions: true,
		json: true,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		colorize: false
	},
	fileError: {
		level: 'error',
		filename: process.cwd() + '/logs/error.log',
		handleExceptions: true,
		json: true,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		colorize: false
	},
	fileDebug: {
		level: 'debug',
		filename: process.cwd() + '/logs/debug.log',
		handleExceptions: true,
		json: true,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		colorize: false
	},
	exceptions: {
		filename: process.cwd() + '/logs/exceptions.log',
		handleExceptions: true,
		json: true,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		colorize: false
	},
	console: {
		level: 'debug',
		handleExceptions: true,
		json: false,
		colorize: true
	}
};

const config = {
	level: 'info',
	transports: [
		new transports.File({filename: 'error.log', level: 'error'}),
		new transports.File(options.fileInfo),
		new transports.File(options.fileError),
		new transports.File(options.fileDebug),
		new transports.Console()
	],
	exceptionHandlers: [
		new transports.File(options.exceptions)
	],
	format: format.combine(
		format.label({label: '[my-label]'}),
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		format.json(),
		//
		// Alternatively you could use this custom printf format if you
		// want to control where the timestamp comes in your final message.
		// Try replacing `format.simple()` above with this:
		//
		format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
	)
};

/**
 * Обертка над логером.
 *
 * @param module
 * @returns {*}
 */
const logger = createLogger(config);

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
	write: function (message) {
		// use the 'info' log level so the output will be picked up by both transports (file and console)
		logger.info(message);
	}
};

module.exports = logger;