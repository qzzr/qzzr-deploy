/**
 * Module dependencies
 */

var deploy = require('poe-deploy');
var http = require('./http');

var app = module.exports = deploy({});

app.plugin(http({
  host: 'qzzr-deploy',
  drain: process.env.DRAIN,
  debug: process.env.DEBUG_HTTP
}));
