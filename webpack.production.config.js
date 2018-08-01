const config = require('./webpack.config.js');

config.mode = "production";
config.output.filename = 'app.min.js';

module.exports = config;