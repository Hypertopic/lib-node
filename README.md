# Client library for the Hypertopic protocol

## Install 

```shell
npm install --save hypertopic
```

## Use

1. Set the services to be called:

```js
const Hypertopic = require('./index.js');

db = new Hypertopic([
  "http://argos2.hypertopic.org",
  "http://steatite.hypertopic.org"
]);
```

2. Send distributed requests

- on a user

```js
db.getView('/user/aaf', x => console.log(JSON.stringify(x, null, 2)));
```
- on an item

```js
db.getView('/item/Vitraux - Bénel/85bb03f5e4930f3b9d1ef9afbfa92421b8e2e23b', x => console.log(JSON.stringify(x, null, 2)));
```

- on a corpus (with all its items)

```js
db.getView('/corpus/Vitraux - Bénel', x => console.log(JSON.stringify(x, null, 2)));
```

- on a viewpoint

```js
db.getView('/viewpoint/a76306e4f17ed4f79e7e481eb9a1bd06', x => console.log(JSON.stringify(x, null, 2)));
```

- on several of them

```js
db.getView(['/corpus/Vitraux - Bénel','/corpus/Vitraux - Recensement'], x => console.log(JSON.stringify(x, null, 2)));
```
