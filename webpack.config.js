const resolvePath = require('resolve-path');
const nodeExternals = require('webpack-node-externals');
/*var fs = require('fs');*/

/*var nodeModules = {};
fs.readdirSync('node_modules')
	.filter(function(x) {
		return ['.bin'].indexOf(x) === -1;
	})
	.forEach(function(mod) {
		nodeModules[mod] = 'commonjs ' + mod;
	});*/

module.exports = {
	target: 'node',
	entry: './index.js',
	output: {
		filename: 'backend.js',
		path: resolvePath(__dirname, 'docker/build')
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.json', '.mjs'],
		alias: {
			config: resolvePath(__dirname, 'config/default.json')
		}
	},
	externals: [nodeExternals()],
	module: {
		rules: [
			{
				test: /\.(ts|tsx)?$/,
				loader: 'ts-loader',
				exclude: ['/node_modules/']
			}, {
				test: /\.(ts|tsx)$/,
				enforce: 'pre',
				loader: 'tslint-loader',
				options: {
					transpileOnly: true,
					experimentalWatchApi: true,
				},
				exclude: ['/node_modules/']
			},
			{
				test: /\.mjs$/,
				type: 'javascript/auto',
			}
		]
	}
};