'use strict';

var winston = require('winston')
  , instance;

/////////////////////
// singleton
////////////////////
instance = null;

var getInstance = function(){
  return instance || (instance = new Logger());
};

var Logger = function() {
  this.logger =  new (winston.Logger)({
    transports: [new (winston.transports.File)({ filename: 'elasticdb.log' })]
    // transports: [new (winston.transports.Console)({ colorize: true })]
  });
  this.logLevel = 'ERROR'
};

Logger.prototype.set = function(key, value) {
  this[key] = value;
};

Logger.prototype.get = function(key, value) {
  return this[key];
};

Logger.prototype.debug = function(msg, data) {
  if (['DEBUG'].indexOf(this.logLevel) !== -1) this.logger.log(msg, data);
};

Logger.prototype.info = function(msg, data) {
  if (['INFO', 'DEBUG'].indexOf(this.logLevel) !== -1) this.logger.info(msg, data);
};

Logger.prototype.warning = function(msg, data) {
  if (['WARNING', 'INFO', 'DEBUG'].indexOf(this.logLevel) !== -1) this.logger.warn(msg, data);
};

Logger.prototype.error = function(msg, data) {
  if (['ERROR', 'WARNING', 'INFO', 'DEBUG'].indexOf(this.logLevel) !== -1) this.logger.error(msg, data);
};

module.exports = getInstance();