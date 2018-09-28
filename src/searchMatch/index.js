const log = require('./../utils/logger');
const {getFootball} = require('./../fetch');
const config = require('config');

const before = config.get('choice.live.football.time.before');
const after = config.get('choice.live.football.time.after');
const rate = config.get('choice.live.football.rate');
const score = config.get('choice.live.football.score');

/**
 * Поиск совпадений по данным стратегиям
 *
 * @returns {*}
 */
function search() {
	getFootball()
		.then((item) => {
			item.map((item) => {
				footballLiveStrategyOne(item);
				footballLiveStrategyTwo(item);
			});
		});
}

/**
 * Стратегия ничья с явным фаворитом
 *
 * @param {Array} item массив ставок
 */
function footballLiveStrategyOne(item) {
	if (item.SC && item.SC.FS && item.E && item.SC.TS) {
		const sc1 = item.SC.FS.S1 ? item.SC.FS.S1 : 0; // проверяем счет матча
		const sc2 = item.SC.FS.S2 ? item.SC.FS.S2 : 0; // проверяем счет матча
		const tm = item.SC.TS ? Math.floor(item.SC.TS / 60) : ''; // проверяем время матча
		if (item.E.length > 2) {
			const p1 = item.E[0] ? item.E[0].C : '';
			const p2 = item.E[2] ? item.E[2].C : '';
			if ((item.O1.indexOf('(') === -1) && (item.O1.indexOf(')') === -1) && (item.O2.indexOf('(') === -1) && (item.O2.indexOf(')') === -1)) {
				if ((tm >= before && tm <= after) && (sc1 + sc2 === score) && (Math.abs(p1 - p2) <= rate) && (p1 !== '') && (p2 !== '')) {
					saveRate(item);
				}
			}
		}
	}
}

/**
 * Стратегия хз
 *
 * @param {Array} item массив ставок
 */
function footballLiveStrategyTwo(item) {

}

function saveRate(item) {
	log.info('id' + item.I);
}

module.exports = {
	search
};