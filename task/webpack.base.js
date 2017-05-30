"use strict";

const path = require('path');
const webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

const extractLess = new ExtractTextPlugin({
    filename: 'styles.css'
});

module.exports = {
    //文件入口
    entry: {
        main: path.resolve(__dirname, '../src/index.ts')
    },
    //输出
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].js'
    },
    //模块配置
    module: {
        rules: [
            //ts文件配置
            {
                test: /\.ts$/i,
                use: 'ts-loader?sourceMap',
            },
            //css文件配置
            // {
            //     test: /\.less$/i,
            //     use: extractLess.extract([
            //         'css-loader?sourceMap',
            //         'less-loader?sourceMap',
            //         // 'autoprefixer-loader',
            //     ])
            // },
            // //html模版
            // {
            //     test: /\.html$/i,
            //     use: [{
            //         loader: 'html-loader',
            //         options: {
            //             minimize: true
            //         }
            //     }]
            // }
        ]
    },
    resolve: {
        alias: {
            // "_core": path.resolve(__dirname, 'src/_core/'),
            "config": "./config.dev",
        },
        extensions: ['.ts', '.tsx', '.js'],
        modules: ['node_modules', 'src']
    },
    plugins: [
        // extractLess,
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        })
    ],
    // plugins: [
    //     new webpack.optimize.CommonsChunkPlugin({
    //         name: 'vendor',
    //         chunks: ['A', 'B'],
    //         minChunks: function (module, count) {
    //             // If module has a path, and inside of the path exists the name "somelib",
    //             // and it is used in 3 separate chunks/entries, then break it out into
    //             // a separate chunk with chunk keyname "my-single-lib-chunk", and filename "my-single-lib-chunk.js"
    //             return module.resource && /_core/.test(module.resource);
    //         }
    //     })
    // ]
    devtool: "source-map"
};