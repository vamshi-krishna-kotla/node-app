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
		/**
		 * webpack plugin to extract CSS into separate files instead of
		 * loading it inside style tag on to the DOM
		 */
		new MiniCssExtractPlugin({
			filename: 'styles/[name].css'
		})
	],
	module: {
		// webpack rules to parse different types of files
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						// babel presets to convert JS into browser executable code
						presets: ['@babel/preset-env', '@babel/preset-react'],

						/**
						 * presets = combination of plugins
						 */

						// plugin to allow assigning properties to classes
						plugins: ['@babel/plugin-proposal-class-properties']
					}
				}
			},
			// CSS rules for CSS modules used inside React components
			{
				test: /\.module.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader: 'css-loader',
						options: {
							importLoaders: 2,
							modules: {
								/**
								 * specify the format of classNames
								 * 
								 * <name-of-file>__<className>__<base64-number-with-specified-digits>
								 * e.g.: .Info-module__info___1ClHo
								 * 
								 * if not mentioned then a random hash will be generated
								 */
								localIdentName: '[name]__[local]___[hash:base64:5]'
							}
						}
					}
				]
			},
			// CSS rule to compile global CSS
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					'css-loader'
				],
				/**
				 * excluding [file].module.css as they are used as CSS modules
				 * in React components
				 */
				exclude: /\.module.css$/
			},
			// SCSS rules for CSS modules used inside React components
			{
				test: /\.module.(scss|sass)$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader: 'css-loader',
						/**
						 * 
						 * NOTE: The options object SHOULD be given for css-loader
						 * even for the SCSS/SASS rules
						 * 
						 * The parsing for CSS modules is done at CSS level but not at SCSS/SASS level
						 */
						options: {
							importLoaders: 2,
							modules: {
								/**
								 * specify the format of classNames
								 * 
								 * <name-of-file>__<className>__<base64-number-with-specified-digits>
								 * e.g.: .Info-module__info___1ClHo
								 * 
								 * if not mentioned then a random hash will be generated
								 */
								localIdentName: '[name]__[local]___[hash:base64:5]'
							}
						}
					},
					'sass-loader'
				]
			},
			// SCSS rule to compile global SCSS
			{
				test: /\.(scss|sass)$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					'css-loader',
					'sass-loader'
				],
				/**
				 * excluding [file].module.scss as they are used as CSS modules
				 * in React components
				 */
				exclude: /\.module.(scss|sass)$/
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
