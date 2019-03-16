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
		return this.waitingEndCount++;
	}

	decrement() {
		return this.waitingEndCount--;
	}
}

module.exports = new CounterWaiting();