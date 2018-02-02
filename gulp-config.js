"use strict";

var path = require('path');
var config = {};

config.SOURCE_DIR = path.join(__dirname, '/');
config.DEST_DIR = path.join(__dirname, 'priv', 'static/');

/*
* JavaScript configuration
*/
config.js = {};

config.js.SOURCE_DIR = path.join(config.SOURCE_DIR, 'js_src/');
config.js.DEST_DIR = path.join(config.DEST_DIR, 'js/');
config.js.DIST_NAME = 'app'; //name of compiled file to be served i.e. app.js and app.min.js
config.js.app_files = ['app'];

//add source dir prefix and .js suffix to js source files
config.js.app_files = config.js.app_files.map(function(file){return path.join(config.js.SOURCE_DIR, file + '.js');});

/*
* Sass/Styles configuration
*/
config.styles = {};
config.styles.SOURCE_DIR = path.join(config.SOURCE_DIR, 'sass/');
config.styles.DEST_DIR = path.join(config.DEST_DIR, 'css/');
config.styles.sass_options = {
  errLogToConsole: true,
  // sourceComments: true, //turns on line number comments 
  outputStyle: 'compressed' //options: expanded, nested, compact, compressed
};


/*
* Export config
*/
module.exports = config;