"use strict";

const path = require('path');
let config = require('./webpack.base.js');

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
module.exports = config;