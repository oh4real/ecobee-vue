const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/background.js',
    output: {
        filename: 'background.js',
        path: path.resolve(__dirname, 'dist/js')
    }
};