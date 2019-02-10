const merge = require('webpack-merge'),
	common = require('./webpack.common.js');

const nodeConfig = {
	entry: './src/main.js',
	mode: 'development',
};

module.exports = merge(common, nodeConfig);