const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const scriptsPath = path.resolve(__dirname, 'src', 'scripts');
const scripts = fs.readdirSync( scriptsPath, "utf8" );

var fileMap = {};
scripts.forEach(script => {
	fileMap[script.replace(/.js$/, '')] = path.resolve(scriptsPath, script);
});

module.exports = {
	entry: fileMap,
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'scripts/[name].js'
	},
	devServer: {
		proxy: {
			'/': 'http://localhost:4000'
		}
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'styles/[name].css'
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					'css-loader'
				]
			},
			{
				test: /\.(scss|sass)$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					'css-loader',
					'sass-loader'
				]
			},
			{
				test: /\.(png|jpeg|jpg|gif)$/,
				use: {
					loader: 'file-loader',
					options: {
						name: 'images/[name].[ext]'
					}
				}
			}
		]
	}
}
