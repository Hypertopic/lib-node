const rewire = require('rewire');
const hypertopic = rewire('../src');

const _assign = hypertopic.__get__('_assign');
const _index = hypertopic.__get__('_index');

it('indexes Hypertopic views', () => {
  let rows = [
    {key: ['a'], value: {b: 'c'}},
    {key: ['a'], value: {b: 'd'}},
    {key: ['q', 'r'], value: 2},
    {key: ['q', 'r'], value: 1},
    {key: ['a', 'e'], value: {f: 'g'}},
    {key: ['a', 'e'], value: {h: {i: 'j', k: 'l'}}},
    {key: ['a', 'e'], value: {h: {i: 'm', k: 'n'}}},
    {key: ['a', 'e'], value: {h: [{i: 'o', k: 'p'}]}}
  ];
  expect(_index(rows)).toEqual({
    q: {
      r: [2, 1]
    },
    a: {
      b: ['c', 'd'],
      e: {
        f: ['g'],
        h: [
          {i: 'j', k: 'l'},
          {i: 'm', k: 'n'},
          {i: 'o', k: 'p'}
        ]
      }
    }
  });
});
