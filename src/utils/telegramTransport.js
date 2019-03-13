const Transport = require('winston-transport');

/**
 * Класс для кастомного транспорта при логировании
 */
class TelegramTransport extends Transport {
	constructor(opts) {
		super(opts);

		if (!opts.level && !opts.stream)
			throw new Error('options.level and opts.stream; is required.');

		this.level = opts.level;
		this._stream = opts.stream;
	}

	log(level, msg, meta, callback) {
		setImmediate(() => {
			this._stream(msg);
			this.emit('logged', msg);
		});
		callback(null, true);
	}
}

module.exports = {
	TelegramTransport
};