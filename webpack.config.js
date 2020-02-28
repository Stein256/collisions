/* eslint-disable no-undef */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const root = path.resolve(__dirname, '.');
const dest = path.resolve(__dirname, '.build');

const config = {
    context: root,
    entry: './src/index.tsx',
    output: {
        path: dest,
        filename: 'js/.bundle.js',
        hotUpdateChunkFilename: 'hot-update/hot-update.js',
        hotUpdateMainFilename: 'hot-update/hot-update.json',
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.ts', '.tsx']
    },
    module: {
        rules: [
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
            { test: /\.(ts|tsx)$/, loader: 'awesome-typescript-loader' },
        ]
    },
    devtool: 'source-map',
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: './index.html',
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
    },
    devServer: {
        hot: true,
    },
}

module.exports = (env, options) => {
    config.mode = options.mode || 'none';
    return config;
}