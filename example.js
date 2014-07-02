var elastic = require('./lib/elasticdb');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/elasticdb_test');

ContactSchema = mongoose.Schema({
  name: { type: String, elastic: true }
});

ContactSchema.plugin(elastic.plugin, 'contact');
Contact = mongoose.model('contact', ContactSchema);

alex = new Contact({ name: 'Alex' });
alex.save(function (err, result) {
  if(err) console.log('err', err)
  else console.log(result)
});

var query = {
  match: {name: 'Alex'}
};

// Client.search(query).then(function(results){
//   console.log(results)
// })

elastic.search(null, query).then(function(results){
  console.log(results)
})


// elastic.syncModel('client').then(function(total){
//   console.log(total)
// })

// elastic.syncAll().then(function(results){
//   console.log('ttt')
// })

// Client.syncModel().then(function(results){
//   console.log(results)
// })