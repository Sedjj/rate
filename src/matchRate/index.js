const config = require('config');
const {decorateMessageTennis, decorateMessageChannel} = require('../utils/formateMessage');
const {bot: {performEmulation}} = require('../selenium/bot');
const {sendMessageChannel, sendMessageChat} = require('../telegram/api');

const typeRate = config['choice'].live['football']['typeRate'];

/**
 * Метод для вывода в телеграмм матча и запуск процедуры "Ставка".
 *
 * @param {FootballModel} statistic объект матча
 * @param {String} type вид спорта
 * @returns {Promise<void>}
 */
async function matchRate(statistic, type = '') {
	const totalRate = statistic.score.sc1 + statistic.score.sc2 + typeRate[statistic.strategy];
	const {
		snapshot: {start: {x, p1, p2, mod, time}},
		cards: {before: {one, two}},
		matchId,
		score: {sc1, sc2},
		total,
		command: {youth, women},
		group: {en},
		bothTeamsToScore: {no}
	} = statistic;
	switch (statistic.strategy) {
		case 1 :
			if (type === 'tennis') {
				if (en.includes('ITF')) {
					/*if (1.5 < Math.abs(p2 - p1) && Math.abs(p2 - p1) <= 2.5) {
						await sendMessageChannel(decorateMessageTennis(statistic, type));
						await sendMessageChannel('2 сет ТМ 12,5');
					}*/
					if (3 < Math.abs(p2 - p1)) {
						await sendMessageChannel(decorateMessageTennis(statistic, type));
						await sendMessageChannel('2 сет ТМ 10,5');
					}
				}
			}
			break;
		case 3 :
			if (sc1 === 1 && sc2 === 0) {
				if (mod < 2.2 && time < 1980 && total < 2) {
					await sendMessageChat(
						decorateMessageChannel(statistic, type),
						'957096927:AAH_tSbDm6a5-SQv-kLjBqrBYQpzOMcUxZA',
						'-1001260584152'
					);
				}
			}
			break;
		case 4 :
			if (2.7 < x && 1.9 < total) {
				if (one.shotsOff < 8 && two.shotsOff < 8) {
					await sendMessageChat(decorateMessageChannel(statistic, type));
					await performEmulation(matchId, 10, `Total Under ${totalRate}`);
				}
			}
			break;
		case 6 :
			if (youth === 0 && women === 0) {
				if (1.5 < no && no < 1.8) {
					if (0 < one.attacks && one.attacks < 33) {
						if (2.7 <= p1 && p1 <= 3.3 && 2.2 <= p2 && p2 <= 2.6) {
							await sendMessageChannel(decorateMessageChannel(statistic, type));
							await sendMessageChannel('Обе забьют: Нет');
						}
					}
				}
			}
			break;
		/*case 7 :
			if (total < 1.9) {
				if (!en.includes('Friend')) {
					await sendMessageChat(
						decorateMessageChannel(statistic, type),
						'957096927:AAH_tSbDm6a5-SQv-kLjBqrBYQpzOMcUxZA',
						'-1001260584152'
					);
				}
			}
			break;*/
		default:
			break;
	}
}

module.exports = {
	matchRate
};