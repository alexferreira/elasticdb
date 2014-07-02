'use strict';

var PromiseB = require('bluebird')
  , elasticsearch = require('elasticsearch')
  , mongoose = require('mongoose')
  , _ = require('lodash')
  , Logger = require('./logger')
  , instance;

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

/////////////////////
// singleton
////////////////////
instance = null;

var getInstance = function(){
  return instance || (instance = new ElasticDb());
};

/**
 * Module definition
 */
var ElasticDb = function() {
  this.elasticClient = null;
  this.prefix = null || 'elasticdb';
  this.models = {};

  this.options = {
    host: 'localhost:9200',
    index: this.prefix,
    apiVersion: '1.1',
    logLevel: 'ERROR'
  };

  Logger.set('logLevel', this.options.logLevel);
};

/**
 * plugin function
 * @param schema
 * @param options
 */

ElasticDb.prototype.plugin = function(schema, options) {
    var self = getInstance();
    options = (typeof options === 'string') ? {type: options} : options;
    options = _.defaults({}, options || {}, self.options);
    
    self.connect(options);
    
    self.models[options.type] = {
      schema: schema,
      options: options
    };
        
    for (var key in schema.paths) {
      var elastic = schema.paths[key].options.elastic;
      if (elastic === 'geojson') self.mapGeojson(options.type);      
    }

    /**
     * Search on current model with predefined index
     * @param query
     * @param cb
     */
    schema.methods.search = function(query) {
      return self.search(options, query);
    };

    /**
     * Search with specifiing a model or index
     * @type {search|Function|string|api.indices.stats.params.search|Boolean|commandObject.search|*}
     */
    schema.statics.search = self.search;


    schema.statics.syncModel = function () {
      return self.syncModel(options.type);
    };


    schema.post('save', function (obj) {
      self.index(obj, schema, options);
    });

    schema.post('remove', function(obj) {
      self.remove(obj._id, options);
    });
  };


/**
 * Connects and tests the elasticClient with a ping
 * @param options
 * @param callback
 */
ElasticDb.prototype.connect = function(options, callback) {
  var self = getInstance();
  // check if the elasticClient has been defined
  if(!this.elasticClient) this.elasticClient = new elasticsearch.Client(options);
  // check the elasticClient with a ping to the cluster and reply the elasticClient
  return new PromiseB(function(resolve, reject) {
    self.elasticClient.ping({
      requestTimeout: 3000,
      hello: 'elasticsearch!'
    },function(err) {
      if(err) {
        reject(err);
      } else {
        resolve(self.elasticClient);
      }
    });
  });
};

/**
 * Index data
 * @param obj
 * @param schema
 * @param options
 */
ElasticDb.prototype.index = function(obj, schema, options) {
  var fields = {};

  for (var key in schema.paths) {
    var item = obj[key];
    
    if (!item) continue;

    var elastic = schema.paths[key].options.elastic;

    if (elastic === true) {
      fields[key] = item;
    } else if (elastic === 'array') {
      for (var key2 in item) {
        fields[key2] = item[key2];
      }
    } else if (elastic === 'geojson') {
      if (!item.coordinates) continue;

      fields.location = {
        lat: item.coordinates[1],
        lon: item.coordinates[0]
      };
    } else if (typeof elastic === 'function') {
      elastic(obj, fields);
    }
  }

  this.elasticClient.index({
    index: options.index ? options.index : this.options.index,
    type: options.type,
    id: String(obj._id),
    body: fields
  }, function (err, resp) {
    if (err) Logger.error('save operation failed', err);
    else if (!err) Logger.info('save operation succeed', resp);
  });
};

/**
 * Delete function
 * @param id
 * @param options
 */

ElasticDb.prototype.remove = function(id, options) {
  this.elasticClient.delete({
    index: options.index ? options.index : this.options.index,
    type: options.type,
    id: String(id)
  }, function (err, resp) {
    if (err) Logger.error('delete operation failed', err);
    else if (!err) Logger.info('delete operation succeed', resp);
  });
};

/**
 * syncModel function
 * @param modelName
 */

ElasticDb.prototype.syncModel = function(modelName) {
  var self = getInstance()
    , schema = this.models[modelName].schema
    , options = this.models[modelName].options
    , model = mongoose.model(modelName.capitalize())
    , stream = model.find().stream()
    , i = 0;

  return new PromiseB(function(resolve, reject) {
    stream.on('data', function (obj) {
      i++;
      self.index(obj, schema, options);
    }).on('error', function (err) {
      Logger.error('synchronize operation failed', err);
      reject(err);
    }).on('close', function() {
      resolve(i);
    });
  });
};

/**
 * syncAll function
 */

ElasticDb.prototype.syncAll = function() {
  var self = getInstance()
    , errors = []
    , modelsKeys = Object.keys(this.models);

  return new PromiseB(function(resolve, reject) {
    var onFinish = _.after(modelsKeys.length, function() {
      if (errors.length) reject(errors);
      else resolve();
    });

    for (var modelName in self.models) {
      self.syncModel(modelName).then(function(){
        onFinish();
      });
    }
  });
};

/**
 * Search function
 * @param options
 * @param query
 */

ElasticDb.prototype.search = function(options, query) {
  var self = getInstance();
  
  options = _.defaults({}, options || {}, self.options);

  return new PromiseB(function(resolve, reject) {
    self.elasticClient.search({
      index: options.index,
      type: options.type,
      body: {query: query },
      from: options.page ? options.page : 0,
      size: options.perPage ? options.perPage : 10
    }, function(err, resp) {
      if(err) reject(err);
      else resolve(resp.hits);
    });
  }).then(function(results){
    Logger.debug('elasticsearch brut result', results);
    results.hits = results.hits.map(function(value) {
      return _.extend(value._source, {_id: value._id, _type: value._type, _score: value._score});
    });
    
    return results;
  });
};

module.exports = getInstance();