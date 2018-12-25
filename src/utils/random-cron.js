const rc = function () {
	const ruleTypes = {
		seconds: {range: [0, 59]},
		minute: {range: [0, 59]},
		hour: {range: [0, 23]},
		day: {range: [1, 31]},
		month: {range: [1, 12]},
		weekday: {range: [0, 6]}
	};
	let rules = {};
	let lastRule;

	const some = function (time) {
		lastRule = time;
		rules[lastRule] = {
			range: ruleTypes[time].range
		};

		return this;
	};

	const between = function (start, end) {
		if (lastRule) {
			rules[lastRule].range = [start, end];
		}

		return this;
	};

	const generate = function () {
		if (Object.keys(rules).length < 1) {
			// if rules are not specified, generate totally in random
			rules = {
				seconds: {range: [0, 59]},
				minute: {range: [0, 59]},
				hour: {range: [0, 23]},
				day: {range: [0, 31]},
				month: {range: [0, 12]}
			};
		}

		const crontab = [];
		let random, minutes;
		const typeNames = Object.keys(ruleTypes);
		for (let i = 0, total = typeNames.length; i < total; i++) {
			const rule = rules[typeNames[i]];
			// FIXME костыль только для секунд
			if (typeNames[i] === 'seconds') {
				random = Math.round(Math.random() * (rule.range[1] - rule.range[0]) + rule.range[0]);
				minutes = Math.floor(random / 60);
				rules[typeNames[i]].value = random - minutes * 60;
			}
			if (typeNames[i] === 'minute') {
				if (minutes > 0) {
					rules[typeNames[i]] = {
						value: minutes
					};
				}
			}

		}
		for (let i = 0, total = typeNames.length; i < total; i++) {
			const rule = rules[typeNames[i]];
			if (rule) {
				crontab.push('*/' + rules[typeNames[i]].value.toString());
			} else {
				crontab.push('*');
			}
		}

		rules = {};
		lastRule = undefined;

		return crontab.join(' ');
	};

	return {
		some: some,
		between: between,
		generate: generate
	};

};

module.exports = rc();