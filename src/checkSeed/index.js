const {dictionary} = require('./../../dictionary');
const WavesAPI = require('@waves/waves-api');
const Waves = WavesAPI.create(WavesAPI.MAINNET_CONFIG);
const log = require('./../utils/logger')(module);


const length = 15;
const buf = new Uint32Array(length);
const wordCount = 2048;

/**
 * Генерация ключа и его проверка.
 *
 * @returns {string}
 */
function checkSeed() {
	
	/**
	 * Составление случайной фразы из 15 слов из списка
	 *
	 * @type {string}
	 */
	let seed = [];
	for (let i = 0; i < length; i++) {
		const wordIndex = buf[i] % wordCount;
		seed.push(dictionary[wordIndex]);
	}
	
	const phrase = seed.join(' ');
	
	/**
	 * Создание объекта кошелька из фразы.
	 *
	 * @type {Seed}
	 */
	const wallet = Waves.Seed.fromExistingPhrase(phrase);
	
	const promises = [];
	let balancesTotal = [];
	
	/**
	 * Проверка баланса Waves
 	 */
	promises.push(
		Waves.API.Node.addresses.balance(wallet.address)
			.then((balance) => {
					if (balance.balance > 0) {
						balancesTotal.push({
							name: 'waves',
							balance: balance.balance
						});
					}
				}
			)
	);
	/**
	 * Проверка балансов ассетов
	 */
	promises.push(
		Waves.API.Node.assets.balances(wallet.address)
			.then((balancesList) => {
				const balances = balancesList.balances.reduce((previousValue, item) => {
					if (item.balance > 0) {
						previousValue.push({
							name: (item.issueTransaction.description !== '') ? item.issueTransaction.description : item.issueTransaction.name,
							balance: item.balance
						});
					}
					return previousValue
				}, []);
				if (balances.length > 0) {
					balancesTotal = balancesTotal.concat(balances)
				}
			})
	);
	
	return Promise.all(promises)
		.then(() => {
			return {data: (balancesTotal.length > 0) ? {seed, balancesTotal} : null};
		});
}

module.exports = {
	checkSeed
};