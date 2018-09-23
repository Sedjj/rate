const config = require('config');
const fetch = require('node-fetch');

const url = config.get('parser.live.football');

/**
 * Get запрос без параметров.
 *
 * @returns {Promise<JSON | void>}
 */
function get() {
	return fetch(url)
		.then((res) => {
			return res.json();
		})
		.catch(console.log);
}

module.exports = {
	get
};