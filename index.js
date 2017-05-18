const concat = require('async/concat');
const request = require('request'); 
const objectPath = require("object-path");

module.exports = function Hypertopic(services) {

  this.getView = function(paths, callback) {
    paths = (paths instanceof Array)? paths : [paths];
    var uris = paths.map(function(p) {
      return encodeURI(p);
    }).map(function(p) {
      return services.map(function(s) {
        return s + p;
      });
    });
    uris = [].concat.apply([], uris);
    concat(uris, _get, function(err, data) {
      callback(_index(data));
    });
  }

  return this;
};

const _get = function(url, callback) {
  request(url, function(error, response, body) {
    var rows = [];
    if (!error && response.statusCode == 200) {
      rows = JSON.parse(body).rows;
    } // Ignore errors
    callback(null, rows);
   });
}

/**
 * Test case:
 *
 *     let o1 = {b:["c"]};
 *     let o2 = {b:"d", e:"f"};
 *     JSON.stringify(_assign(o1, o1)) === JSON.stringify({b:["c","d"], e:["f"]});     
 */
const _assign = function(target, source) {
  for (var k in source) {
    if (k[0] !== '_' && !['Sans nom', '', ' '].includes(source[k])) {
      if (!target[k]) {
        target[k] = [];
      } else if (target[k].includes(source[k])) {
        continue;
      }
      target[k].push(source[k]);
    }
  }
}
 
/** 
 * Test case:
 *
 *     let rows = [{
 *       {key:["a"], value:{b:"c"}},
 *       {key:["a"], value:{b:"d"}},
 *       {key:["a","e"], value:{f:"g"}}
 *     }];
 *     JSON.stringify(_index(rows)) === JSON.stringify({a:{b:["c","d"], e:{f:"g"}}}); 
 */
const _index = function(rows) {
  var data = {};
  rows.forEach(function(r) {
    var key = r.key;
    objectPath.ensureExists(data, key, {});
    _assign(objectPath.get(data, key), r.value);
  });
  return data;
}
