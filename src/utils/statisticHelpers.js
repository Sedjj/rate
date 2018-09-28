const log = require('./logger');
const statisticModel = require('../models/statistic');

/**
 * Преобразовывает вид работ в необходимый формат
 *
 * @param {Object} category вид работ
 * @return {Object}
 */
function mapProps(category) {
	return {
		id: category.id,
		name: category.name,
		parentId: category.parentId,
		order: category.order
	};
}


/**
 * Проверяет на наличие зависимых данных.
 *
 * @param {Object} params параметры для создания объекта статистики
 * @return {Boolean}
 */
async function checkDependencies(params) {
	const statistic = new statisticModel(params);
	 statistic.save()
		.then(statistic => {
			return 	statistic
		})
		.catch(error => {
			log.info('add statistic ', error);
		});
}


module.exports = {
	mapProps,
	fillChildren,
	updateReportsDisplayCategories
};