"use strict";

const path = require('path');
let config = require('./webpack.base.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractLess = new ExtractTextPlugin({
    filename: 'styles.css'
});

config.output = {
    path: path.resolve(__dirname, '../.temp'),
    filename: '[name].js'
};
config.devServer = {
    contentBase: ['./.temp', './node_modules', './src'],
    compress: true,
    host: 'localhost',
    port: 4000
};
config.module.rules.push(
    //css文件配置
    {
        test: /\.less$/i,
        use: extractLess.extract([
            'css-loader?sourceMap',
            'less-loader?sourceMap',
            // 'autoprefixer-loader',
        ])
    });
config.plugins.push(extractLess);
module.exports = config;