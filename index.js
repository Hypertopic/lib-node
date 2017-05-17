const concat = require('async/concat');
const request = require('request'); 
const objectPath = require("object-path");

module.exports = class Hypertopic {
  constructor(services) {
    this.services = services;
  }

  getView(paths, callback) {
    paths = (paths instanceof Array)? paths : [paths];
    let uris = paths.map(p => encodeURI(p))
      .map(p => this.services.map(s => s + p)
    );
    uris = [].concat(...uris);
    concat(uris, _get, function(err, data) {
      callback(_index(data));
    });
  }
}

const _get = function(url, callback) {
  request(url, function(error, response, body) {
    let rows = [];
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
  for (let k in source) {
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
  let data = {};
  for (r of rows) {
    let key = r.key;
    objectPath.ensureExists(data, key, {});
    _assign(objectPath.get(data, key), r.value);
  }
  return data;
}
