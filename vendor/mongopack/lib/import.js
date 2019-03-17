/*
*@param Options {options}
*@param Database <String>
*@Param Collection <String>
*@Param File <String> relative or absolute path;
*@param callback <function> with error is the first parameter
*@return typeof result from callback<String | Boolean | Number ...>
*/

const flag = require('../util').flag;
const flagCustom = require('../util').flagCustom;
const exec = require('child_process').exec;
const defaultFormat = 'csv';

function importData(exec) {
	// All fields are mandatory except the callback;
	// optional options include HOST | PORT | USERNAME | PASSWORD | DESTINATION | TYPE
	return function Import(databases, collection, files, options) {
		let cmd = '';
		const host = options.host || 'localhost';
		const port = options.port || 27017;
		const username = options.username || '';
		const password = options.password || '';
		let database = databases;
		let file = files || ''; // if undefined, mongoimport reads from the stdin
		const type = options.type || defaultFormat;
		
		// use fieldFile option in place of the fields option (eg. headerline.txt) for <tsv|csv> files,
		// place on per line ends with \x0a;
		const fieldFile = options.fieldFile ? options.fieldFile : ''; // not needed when csv|tsv has headerline
		
		let fields; // not needed when csv|tsv has headerline
		if (options.fields) {
			if (Array.isArray(options.fields)) {
				fields = options.fields.join(',');
			} else {
				fields = options.fields;
			}
		}
		
		if ((username && !password) || (!username && password)) {
			throw new Error('both username and password must be provided, not one without the other!.');
		}
		
		// handle key options for db
		cmd += flag('host') + host
			+ flag('port') + port
			+ flag('db') + database
			+ flag('file') + file
			+ flag('collection') + collection;
		
		cmd += username ? flag('username') + username : '';
		cmd += password ? flag('password') + password : '';
		cmd += fieldFile ? flag('fieldFile') + fieldFile : '';
		cmd += fields ? flag('fields') + fields : '';
		cmd += type ? flagCustom('type') + type : '';
		
		for (let i in options) {
			if (typeof options[i] == 'boolean' && options[i] === true) {
				cmd += flag(i);
				// to ensure options already treated are not overwritten
			} else if (['fields', 'fieldFile', 'query', 'username', 'password', 'port', 'host', 'type'].indexOf(i)) {
				continue;
			} else {
				cmd += options[i] ? flag(i) + options[i] : '';
			}
		}
		
		cmd = 'mongoimport ' + cmd;
		console.log(`cmd: ${cmd}`);
		return new Promise((resolve, reject) => {
			exec(cmd, (error, stdout) => {
				if (error) {
					reject(error.message);
				}
				resolve(stdout);
			});
		});
	};
	
}

module.exports = importData(exec);
