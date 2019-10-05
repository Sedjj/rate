const {BetAmount} = require('./betAmount');
const {CounterWaiting} = require('./counterWaiting');
const {RateStatus} = require('./rateStatus');

const rateAmount = new BetAmount();
const counterWaiting = new CounterWaiting();
const rateStatus = new RateStatus();

module.exports = {
	rateAmount,
	counterWaiting,
	rateStatus
};