"use strict";

const path = require('path');
let config = require('./webpack.base.js');

config.output = {
    path: path.resolve(__dirname, '../.dist'),
    filename: '[name].js'
};
module.exports = config;