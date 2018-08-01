const path = require('path');

module.exports = {
    mode: "development",
    entry: './js_src/app.js',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'priv/static/js')
    }
};