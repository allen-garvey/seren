const path = require('path');

module.exports = {
    mode: "development",
    entry: './js_src/app.js',
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'priv/static/js')
    },
    resolve: {
        alias: {
            'vue': path.resolve(__dirname, 'node_modules/vue/dist/vue.js'),
            'vue-infinite-scroll': path.resolve(__dirname, 'node_modules/vue-infinite-scroll/vue-infinite-scroll.js'),
        }
    }
};