const {BetAmount} = require('./betAmount');
const {CounterWaiting} = require('./counterWaiting');
const {RateStatus} = require('./rateStatus');
const {AuthPhone} = require('./authPhone');

const rateAmount = new BetAmount();
const counterWaiting = new CounterWaiting();
const rateStatus = new RateStatus();
const authPhone = new AuthPhone();

module.exports = {
	rateAmount,
	counterWaiting,
	rateStatus,
	authPhone,
};