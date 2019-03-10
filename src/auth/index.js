const config = require('config');
const log = require('../utils/logger');
const {encode} = require('../utils/crypt');
const {authentication, putbetsCommon, updateCoupon} = require('../fetch');

const active = config.get('parser.active');
const auth = config.get(`parser.${active[0]}.authentication.auth`);
const update = config.get(`parser.${active[0]}.rate.updateCoupon`);
const putbets = config.get(`parser.${active[0]}.rate.putbetscommon`);

function performAuth() {
	const param = {
		uLogin: encode('55311279'), // 'NTUzMTEyNzk=',
		uPassword: encode('088706'), // 'MDg4NzA2'
	};
	const ggru = 146;
	const session = '6b56e2056835707eb81cee488999e2f3';
	const header = {
		cookie: `ggru=${ggru}; SESSION=${session};`
	};
	authentication(auth, param, header)
		.then((body) => {
			if (body.message !== '') {
				putbetsCommon(putbets, {
					'Live': true,
					'Events': [{
						'GameId': 186133331,
						'Type': 10,
						'Coef': 1.9, // значение ставки
						'Param': 1, // коэфициент ставки
						'PlayerId': 0,
						'Kind': 1,
						'InstrumentId': 0,
						'Seconds': 0,
						'Price': 0,
						'Expired': 0
					}],
					'Summ': '20',
					'Lng': 'en',
					'UserId': 55311279,
					'Vid': 0,
					'hash': '560164bd9545333ad0d346fedb4c9763',
					'CfView': 0,
					'notWait': true,
					'Source': 50,
					'CheckCf': 2,
					'partner': 51
				});
				/*updateCoupon(update, {"Events":[{"GameId":186133331,"Type":10,"Coef":1.9,"Param":1,"PlayerId":0,"Kind":1,"InstrumentId":0,"Seconds":0,"Price":0,"Expired":0}],"NeedUpdateLine":false,"Lng":"en","UserId":55311279,"CfView":0,"Vid":0,"partner":51});
				putbetsCommon(putbets);*/
			}
		})
		.then(() => {

		})
		.catch(error => {
			log.debug(`Ошибка авторизации: ${JSON.stringify(param)}, error: ${error}`);
		});
}

module.exports = {
	performAuth
};