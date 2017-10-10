# Client library for the Hypertopic protocol

## Install 

```shell
npm install --save hypertopic
```

## Use

### Set the services to be called

```js
const hypertopic = require('hypertopic');

let db = hypertopic([
  "http://argos2.test.hypertopic.org",
  "http://steatite.hypertopic.org"
]);

const _log = (x) => console.log(JSON.stringify(x, null, 2));
const _error = (x) => console.error(x.message);
```

### Send distributed requests

- on a user

```js
db.getView('/user/aaf')
  .then(_log);
```
- on an item

```js
db.getView('/item/Vitraux - Bénel/85bb03f5e4930f3b9d1ef9afbfa92421b8e2e23b')
  .then(_log);
```

- on a corpus (with all its items)

```js
db.getView('/corpus/Vitraux - Bénel')
  .then(_log);
```

- on a viewpoint

```js
db.getView('/viewpoint/a76306e4f17ed4f79e7e481eb9a1bd06')
  .then(_log);
```

- on several of them

```js
db.getView(['/corpus/Vitraux - Bénel','/corpus/Vitraux - Recensement'])
  .then(_log);
```

- on all corpora and viewpoints of a user

```js
db.getView('/user/vitraux')
  .then(x =>
    x.vitraux.viewpoint.map(y => `/viewpoint/${y.id}`)
      .concat(x.vitraux.corpus.map(y => `/corpus/${y.id}`))
  )
  .then(db.getView)
  .then(_log);
```

### Update objects

- Create an object (with an automatic ID)

```js
db.post({item_name:'Bond', item_corpus:'TEST'})
  .then(_log)
  .catch(_error);
```

- Create an object with a given ID

```js
db.post({_id:'007', item_name:'Bond', item_corpus:'TEST'})
  .then(_log)
  .catch(_error);
```

- Update an object

```js
db.get({_id:'007'})
  .then(x => Object.assign(x, {item_name:'James Bond'}))
  .then(db.post)
  .then(_log)
  .catch(_error);
```

- Delete an object with update conflict detection

```js
db.delete({_id:'007', _rev='1-xxxxxxxxx'});
  .then(_log)
  .catch(_error);
```

- Delete an object with no conflict detection (to be used with caution!)

```js
db.get({_id:'007'})
  .then(db.delete)
  .then(_log)
  .catch(_error);
```

