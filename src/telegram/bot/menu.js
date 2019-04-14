function menuList(item) {
	switch (item) {
		case 'waiting':
			return {
				id: 1,
				title: 'Тест',
				buttons: [
					[{text: 'Ровно столько, сколько указано в определении функции.', callback_data: '0_1'}],
					[{text: 'Сколько указано в определении функции или меньше.', callback_data: '0_2'}],
					[{text: 'Сколько указано в определении функции или больше.', callback_data: '0_3'}],
					[{text: 'Любое количество.', callback_data: '0_4'}]
				]
			};
		case 'export':
			return {
				id: 2,
				title: 'Выбирие вид экспорта',
				buttons: [
					[{text: 'Экспорт футбола за 2 дня', callback_data: 'twoDaysExportFootball'}],
					[{text: 'Экспорт тениса за 2 дня', callback_data: 'twoDaysExportTableTennis'}],
					[{text: 'Экспорт футбола за неделю\'', callback_data: 'weekExportFootball'}],
					[{text: 'Экспорт за тениса неделю\'', callback_data: 'weekExportTableTennis'}]
				]
			};
		case 'backup':
			return {
				id: 3,
				title: 'Выберите тип бэкапа',
				buttons: [
					[{text: 'Бэкап footballs', callback_data: 'exportBackupFootballs'}],
					[{text: 'Бэкап tableTennis', callback_data: 'exportBackupTableTennis'}]
				]
			};
	}
}

module.exports = {
	menuList
};