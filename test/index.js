var elasticdb = require('../lib/elasticdb')
  , assert = require('assert')
  , should = require('should')
  , mongoose = require('mongoose');

// mongoose.set('debug', true);

describe('elasticdb', function(){  
  var CatSchema, Cat;
  before(function() {
    mongoose.connect('mongodb://localhost/elasticdb_test');

    CatSchema = mongoose.Schema({
      name: {type: String, elastic: true},
      description: {type: String}
    });
    CatSchema.plugin(elasticdb.plugin, 'cat');
    Cat = mongoose.model('cat', CatSchema);
  });
  
  it('should be a function', function () {
    assert('object' === typeof elasticdb);
  });

  describe('create connection', function(){
    it('should create a connection', function(done){
      elasticdb.connect('elasticdb', {
        host: 'localhost:9200',
        sniffOnStart: true
      }).then(function(conn){
        conn.should.be.an.Object;
        done();
      }, function(err){
        should.not.exist(err);
      });
    });
  });

  describe('save mongoose model', function() {
    var cat;

    elasticdb.index
    it('should create a new object in mongoose model', function(done) {
      cat = new Cat({ name: 'Sound' });
      cat.save(function (err, result) {
        should.not.exist(err);
        result.should.be.an.Object;
        done();
      });
    });

    it('should update a mongoose object', function(done) {
      cat.name = 'DVD';
      cat.save(function (err, result) {
        should.not.exist(err);
        result.should.be.an.Object;
        setTimeout(function() {
          done();
        }, 1000);
      });
    });

    describe('Search model', function() {
      it('should find the mongoose object', function(done) {
        var query = {
          match: {_id: cat._id}
        };

        cat.search(query).then(function(results){
          results.total.should.eql(1);
          results.hits[0].should.be.an.Object;
          done();
        }, function(err){
          should.not.exist(err);
        });
      });
    });

    it('should sync mongodb', function(done) {
      Cat.syncModel().then(function(){
        done();
      }, function(err){
        errcount.should.eql(0);
      });
    });

    it('should delete the mongoose object', function(done) {
      cat.remove(function(err) {
        should.not.exist(err);
        done();
      });
    });
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    });
  });
});