"use strict";

const path = require('path');
let config = require('./webpack.base.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractLess = new ExtractTextPlugin({
    filename: 'styles-[chunkhash:10].css'
});

config.output = {
    path: path.resolve(__dirname, '../.dist'),
    filename: '[name]-[chunkhash:10].js'
};
config.module.rules.push(
    //css文件配置
    {
        test: /\.less$/i,
        use: extractLess.extract([
            'css-loader',
            'less-loader',
            // 'autoprefixer-loader'
        ])
    });
config.plugins.push(extractLess);
module.exports = config;