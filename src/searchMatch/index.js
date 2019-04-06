const {log} = require('../utils/logger');
const {getAllMatches} = require('../fetch');
const config = require('config');
const {footballLiveStrategy} = require('../viewSport/football');
const {tableTennisLiveStrategy} = require('../viewSport/tableTennis');
const {searchHelper} = require('../modifiableFile');

const active = config.parser.active;
const urlFootballRate = config.get(`parser.${active[0]}.live.football.rate`);
const urlTableTennisRate = config.get(`parser.${active[0]}.live.tableTennis.rate`);

/**
 * Метод поиска совпадений по данным стратегиям.
 */
async function searchFootball() {
	try {
		const football = await getAllMatches(urlFootballRate);
		football.forEach((item) => {
			try {
				footballLiveStrategy(searchHelper['getParams'](item));
			} catch (error) {
				log.debug(`Ошибка при парсинге матча: ${JSON.stringify(item)} error: ${error}`);
			}
		});
	} catch (error) {
		log.error(`search: ${error}`);
	}
}

/**
 * Метод поиска совпадений по данным стратегиям.
 */
async function searchTableTennis() {
	try {
		const tableTennis = await getAllMatches(urlTableTennisRate);
		tableTennis.forEach((item) => {
			try {
				tableTennisLiveStrategy(searchHelper['getParams'](item));
			} catch (error) {
				log.debug(`Ошибка при парсинге матча: ${JSON.stringify(item)} error: ${error}`);
			}
		});
	} catch (error) {
		log.error(`search: ${error}`);
	}
}

module.exports = {
	searchFootball,
	searchTableTennis
};