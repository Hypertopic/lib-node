const fetch = require('node-fetch');
const objectPath = require("object-path");

module.exports = function Hypertopic(services) {

  this.getView = function(paths) {
    paths = (paths instanceof Array)? paths : [paths];
    var uris = paths.map(function(p) {
      return encodeURI(p);
    }).map(function(p) {
      return services.map(function(s) {
        return s + p;
      });
    });
    uris = [].concat.apply([], uris);
    return Promise.all(uris.map(_get))
      .then(l => l.reduce(_concat, []))
      .then(_index);
  }

  const _fetch = (id, request, success) => fetch(services[0] + '/' + id, request)
    .then(x => {
      if (x.ok) {
        return x.json();
      }
      throw new Error(x.statusText);
    })
    .then(x => success(x));

  this.get = (o) => _fetch(o._id, {}, x => x);

  this.post = (o) => _fetch('', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify(o)
  }, x => Object.assign(o, {_id: x.id, _rev: x.rev}));

  this.delete = (o) => _fetch(o._id, {
    method: 'DELETE',
    credentials: 'include',
    headers: {'If-Match': o._rev}
  }, x => ({_id: x.id, _rev: x.rev}));

  return this;
};

const _get = (uri) => fetch(uri)
  .then(x => x.json())
  .catch(_ => ({rows:[]}));

const _concat = (l, x) => l.concat(x.rows);

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
 
const _index = function(rows) {
  var data = {};
  rows.forEach(function(r) {
    var key = r.key;
    objectPath.ensureExists(data, key, {});
    _assign(objectPath.get(data, key), r.value);
  });
  return data;
}
