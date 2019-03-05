const path = require('path'),
	CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
	output: {
		publicPath: path.resolve(__dirname, '../assets'),
		path: path.resolve(__dirname, '../'),
		filename: 'hiddout.js',
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
							'@babel/preset-env',
							{
								useBuiltIns: 'usage',
							},
						],
							"@babel/preset-react",
							'@babel/preset-flow',
						],
						plugins: [
							'@babel/plugin-proposal-class-properties',
							'@babel/plugin-proposal-object-rest-spread',
						],
					},
				},
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			}, {
				test: /\.(png|jpg|jpeg|ico|ttf|otf|eot|svg|woff(2)?)$/,
				use: ['file-loader']
			},
			{
				test: /\.html$/,
				exclude: /node_modules/,
				use: {
					loader: 'html-es6-template-loader',
					options: {
						transpile: true,
					},
				},
			},
		],
	},
	plugins: [
		new CircularDependencyPlugin({
			exclude: /node_modules/,
			failOnError: true,
			cwd: process.cwd(),
		})
	],
};