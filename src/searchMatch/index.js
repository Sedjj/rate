const log = require('./../utils/logger');
const {get} = require('./../fetch');

function search() {
	return get()
		.then((item) => {
			return item.Value;
		}).map((item) => {
			console.log('id', item.I);
		
			if (item.E) {
				let p1 = item.E.length > 0 ? item.E[0].C : '';
				let p2 = item.E.length > 2 ? item.E[2].C : '';
			}
			
			if (item.SC && item.SC.FS) {
				var sc1 = item.SC.FS.S1;
				var sc2 = item.SC.FS.S2;
				sc1 = typeof sc1 != 'undefined' ? sc1 : 0;
				sc2 = typeof sc2 != 'undefined' ? sc2 : 0;
			} else {
				sc1 = 0;
				sc2 = 0;
			}
			
			let tm = item.SC.TS;
			tm = typeof tm != 'undefined' ? Math.floor(tm / 60) : '';
			
			if ((tm >= 30 && tm <= 50) && (sc1 + sc2 == 1) && (Math.abs(p1 - p2) <= 0.5) && (p1 != '') && (p2 != '')) {
				if (props.getProperties()['id' + id] != 'true') {
					console.log(id);
					props.setProperty('id' + id, 'true');
					var keys = props.getKeys();
					if (keys.length > 100) {
						props.deleteProperty(keys[keys.length - 1]);
					}
				}
			}
		});
	//	console.log('item', item);
}

module.exports = {
	search
};