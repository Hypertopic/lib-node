# Client library for the Hypertopic protocol

## Install 

```shell
npm install --save hypertopic
```

## Use

1. Set the services to be called:

```js
const hypertopic = require('hypertopic');

let db = hypertopic([
  "http://argos2.hypertopic.org",
  "http://steatite.hypertopic.org"
]);

const _log = (x) => console.log(JSON.stringify(x, null, 2));
```

2. Send distributed requests

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
