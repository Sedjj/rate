const {log} = require('../utils/logger');

/**
 * Класс для подсчета ожидающих матчей
 */
class CounterWaiting {

	constructor() {
		this.waitingEndCount = 0;
	}

	get count() {
		return this.waitingEndCount;
	}

	increment() {
		log.debug(`Всего в очереди на окончание матча: ${this.waitingEndCount + 1}`);
		return this.waitingEndCount++;
	}

	decrement() {
		log.debug(`Всего в очереди на окончание матча осталось: ${this.waitingEndCount - 1}`);
		return this.waitingEndCount--;
	}
}

const counterWaiting = new CounterWaiting();

module.exports = {
	counterWaiting
};