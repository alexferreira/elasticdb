[![NPM version](https://badge.fury.io/js/elasticdb@1x.png)](http://badge.fury.io/js/elasticdb)

[![Build Status](https://travis-ci.org/alexferreira/elasticdb.svg?branch=master)](https://travis-ci.org/alexferreira/elasticdb)

[![NPM](https://nodei.co/npm-dl/elasticdb.png?months=1)](https://nodei.co/npm/elasticdb/)

[![NPM](https://nodei.co/npm/elasticdb.png?downloads=true&stars=true)](https://nodei.co/npm/elasticdb/)

ElasticDb
===========

ElasticDb é um plugin para mongooosejs que fornece a funcionalidade de indexação automática no elasticsearch.

O ElasticDb é baseado no [elastichsearch](https://www.npmjs.org/package/elasticsearch) um cliente baixo nível oficial para Node.js e navegador.

## Instalação

`npm install --save elasticdb`


## Uso

Para usar deve-se registrar como um um plugin e adicionar o nome do model; 

```js
var elasticdb = require('elasticdb');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/elasticdb_test');

var ContactSchema = mongoose.Schema({
  name: {type: Date, default: '', elastic: true},
  date: {type: Date, default: Date.now}  
});

ContactSchema.plugin(elasticdb.plugin, 'client');
var Client = mongoose.model('client', ContactSchema);
```

## License (MIT)

Copyright (c) 2014 Alex Ferreira

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.