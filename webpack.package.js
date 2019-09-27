const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/background.js',
    output: {
        filename: 'background.js',
        path: path.resolve(__dirname, 'dist/js')
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: 'env.js'
        }]),
    ]
};