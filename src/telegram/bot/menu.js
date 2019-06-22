function menuList(item) {
	switch (item) {
		case 'days':
			return {
				id: 1,
				title: 'Выберите количество дней на экспорт',
				buttons: [
					[{text: '-', callback_data: 'down'}, {text: '2'}, {text: '+', callback_data: 'up'}],
					[{text: 'экспорт', callback_data: 'export'}]
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
				]
			};
		case 'rate':
			return {
				id: 3,
				title: 'Выберите действие',
				buttons: [
					[{text: 'Вкл ставки', callback_data: 'enableBets'}],
					[{text: 'Выкл ставки', callback_data: 'turnOffBets'}]
				]
			};
		case 'backup':
			return {
				id: 3,
				title: 'Выберите тип бэкапа',
				buttons: [
					[{text: 'Бэкап футбол', callback_data: 'backupFootballs'}],
					[{text: 'Бэкап настольный тенис', callback_data: 'backupTableTennis'}],
					[{text: 'Бэкап большой тенис', callback_data: 'backupTennis'}]
				]
			};
		case 'getFile':
			return {
				id: 3,
				title: 'Выберите файл для скачивания',
				buttons: [
					[{text: 'debug logs', callback_data: 'debugLogs'}],
				]
			};
	}
}

module.exports = {
	menuList
};