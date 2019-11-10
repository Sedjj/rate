function menuList(item, text= 0) {
	switch (item) {
		case 'days':
			return {
				id: 1,
				title: 'Выберите количество дней на экспорт',
				buttons: [
					[{text: '-', callback_data: 'down'}, {text: text, callback_data: 'value'}, {text: '+', callback_data: 'up'}],
					[{text: 'экспорт', callback_data: 'export'}],
				]
			};
		case 'selectSport':
			return {
				id: 2,
				title: 'Выбирие вид спорта',
				buttons: [
					[{text: 'Футбол', callback_data: 'exportFootball'}],
					[{text: 'Настольный тенис', callback_data: 'exportTableTennis'}],
					[{text: 'Большой тенис', callback_data: 'exportTennis'}],
					[{text: 'Баскетбол', callback_data: 'exportBasketball'}],
				]
			};
		case 'rate':
			return {
				id: 3,
				title: 'Выберите действие',
				buttons: [
					[{text: 'Вкл ставки', callback_data: 'enableBets'}],
					[{text: 'Выкл ставки', callback_data: 'turnOffBets'}],
				]
			};
		case 'backup':
			return {
				id: 4,
				title: 'Выберите тип бэкапа',
				buttons: [
					[{text: 'Бэкап футбол', callback_data: 'backupFootballs'}],
					[{text: 'Бэкап настольный тенис', callback_data: 'backupTableTennis'}],
					[{text: 'Бэкап большой тенис', callback_data: 'backupTennis'}],
					[{text: 'Бэкап баскетбола', callback_data: 'backupBasketball'}],
				]
			};
		case 'getFile':
			return {
				id: 5,
				title: 'Выберите файл для скачивания',
				buttons: [
					[{text: 'debug logs', callback_data: 'debugLogs'}],
				]
			};
		case 'betAmount':
			return {
				id: 6,
				title: 'Выберите сумму ставки',
				buttons: [
					[{text: '-10', callback_data: 'downBets'}, {text: text, callback_data: 'value'}, {text: '+10', callback_data: 'upBets'}],
				]
			};
	}
}

module.exports = {
	menuList
};