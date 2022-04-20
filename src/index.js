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
    headers: headers({'Content-Type': 'application/json'}),
    credentials: 'include',
    body: JSON.stringify(o)
  }, x => Object.assign(o, {_id: x.id, _rev: x.rev}));

  this.delete = (o) => _fetch(o._id, {
    method: 'DELETE',
    credentials: 'include',
    headers: headers({'If-Match': o._rev})
  }, x => ({_id: x.id, _rev: x.rev}));

  this.item = (o) => new Item (
    this,
    this.get(o).catch(x => ({_id: o._id, item_corpus: o.item_corpus}))
  );

  headers = (additional) => (!this.credentials) ? additional
    : Object.assign({}, additional, {
      'Authorization': 'Basic ' + Buffer.from(`${this.credentials.name}:${this.credentials.password}`).toString('base64')
    });

  this.auth = (name, password) => {
    this.credentials = {name, password};
    return this;
  };

  function Item(db, item) {

    this.setAttributes = (attributes) => item
      .then(o => Object.assign(o, attributes))
      .then(db.post);

    this.unsetAttribute = (key) => item
      .then((o) => {
        delete o[key];
        return o;
      })
      .then(db.post);

    this.setTopic = (topic, viewpoint) => item
      .then(o => {
        o.topics = o.topics || {};
        o.topics[topic] = {viewpoint};
        return o;
      })
      .then(db.post);

    this.unsetTopic = (topic_id) => item
      .then((o) => {
        if (o.topics)
          delete o.topics[topic_id];
        return o;
      })
      .then(db.post);

    this.setResource = (resource_id, content_type, raw_data) => item
      .then(o => ({
        ...o,
        _attachments: {
          ...o._attachments,
          [resource_id]: {
            content_type,
            data: Buffer.from(raw_data).toString('base64')
          }
        }
      }))
      .then(db.post)

    this.unsetResource = (resource_id) => item
      .then(o => {
        if (o._attachments) {
          delete o._attachments[resource_id];
        }
        return o;
      })
      .then(db.post);

    this.then = x => item.then(x);

    return this;
  }

  return this;
};

const _get = (uri) => fetch(uri)
  .then(x => x.json())
  .catch(_ => ({rows:[]}));

const _concat = (l, x) => l.concat(x.rows);

const _ensureExists =
  (data, path, value) => objectPath.ensureExists(data, path, value) || value;

const _assign = function(data, row) {
  let source = row.value;
  switch (typeof source) {
    case 'number': {
      let target = _ensureExists(data, row.key, []);
      target.push(source);
      break;
    }
    case 'object': {
      let target = _ensureExists(data, row.key, {});
      for (var k in source) {
        if (k[0] !== '_') {
          if (!target[k]) {
            target[k] = [];
          }
          let values = source[k];
          values = Array.isArray(values)? values : [values];
          for (var v of values) {
            if (['Sans nom', '', ' '].includes(v) || target[k].includes(v)) continue;
            target[k].push(v);
          }
        }
      }
      break;
    }
    default: console.error(`Type ${typeof source} not handled!`);
  }
}
 
const _index = function(rows) {
  var data = {};
  rows.forEach(function(r) {
    _assign(data, r);
  });
  return data;
}
