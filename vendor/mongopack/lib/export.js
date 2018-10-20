/*
*@param Options {options}
*@param Database <String>
*@Param Collection <String>
*@Param Destination <String> relative or absolute path;
*@return typeof result from callback<String | Boolean | Number ...>
*/

var flag = require('../util').flag;
var flagCustom = require('../util').flagCustom;
var temp = require('os').tmpDir;
var exec = require('child_process').exec;
var defaultFormat = 'csv';

function exportData(exec) {
	// All fields are mandatory except the callback;
	// optional options include HOST | PORT | USERNAME | PASSWORD | DESTINATION | TYPE
	return function Export(database, collection, destination, options) {
		var cmd = '';
		var host = options.host || 'localhost';
		var port = options.port || 27017;
		var username = options.username || '';
		var password = options.password || '';
		var database = database || 'test';
		var destination = destination || temp();
		var type = options.type || defaultFormat;
		
		// enclosing the query with a single quote(')
		var query = options.query ? '"' + options.query + '"' : '';
		
		if ((!options.fields || !options.fieldFile) && options.type == defaultFormat) {
			throw new Error('to export a csv file, fields or fieldFile options must be provided')
		}
		
		// use fieldFile option in place of the fields option (eg. headerline.txt) for <tsv|csv> files,
		// place on per line ends with \x0a;
		var fieldFile = options.fieldFile ? options.fieldFile : ''; // not needed when csv|tsv has headerline
		
		var fields; // not needed when csv|tsv has headerline
		if (options.fields) {
			if (Array.isArray(options.fields)) {
				fields = options.fields.join(',');
			} else {
				fields = options.fields;
			}
		}
		
		if (username && !password || !username && password) {
			throw new Error('both username and password must be provided, not one without the other!.');
		}
		
		// handle key options for db
		cmd += flag('host') + host
			+ flag('port') + port
			+ flag('db') + database
			+ flag('out') + destination
			+ flag('collection') + collection;
		
		cmd += username ? flag('username') + username : '';
		cmd += password ? flag('password') + password : '';
		cmd += fieldFile ? flag('fieldFile') + fieldFile : '';
		cmd += query ? flag('query') + query : '';
		cmd += fields ? flag('fields') + fields : '';
		cmd += type ? flagCustom('type') + type : '';
		
		for (var i in options) {
			if (typeof options[i] == 'boolean' && options[i] == true) {
				cmd += flag(i);
			} else if (['fields', 'fieldFile', 'query', 'username', 'password', 'port', 'host', 'type'].indexOf(i)) {
				continue;
			} else {
				cmd += options[i] ? flag(i) + options[i] : '';
			}
		}
		
		cmd = 'mongoexport ' + cmd;
		return new Promise((resolve, reject) => {
			exec(cmd, (error, stdout) => {
				if (error) {
					reject(error);
				}
				resolve(stdout);
			});
		});
	}
}

module.exports = exportData(exec);
