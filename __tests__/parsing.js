const rewire = require('rewire');
const hypertopic = rewire('../src');

const _assign = hypertopic.__get__('_assign');
const _index = hypertopic.__get__('_index');

it('indexes Hypertopic views', () => {
  let rows = [
    {key: ['a'], value: {b: 'c'}},
    {key: ['a'], value: {b: 'd'}},
    {key: ['a', 'e'], value: {f: 'g'}},
    {key: ['a', 'e'], value: {h: {i: 'j', k: 'l'}}},
    {key: ['a', 'e'], value: {h: {i: 'm', k: 'n'}}},
    {key: ['a', 'e'], value: {h: [{i: 'o', k: 'p'}]}}
  ];
  expect(_index(rows)).toEqual({
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

it('assigns an object to another one by concatenating values into arrays', () =>  {
  let o1 = {
    b: ["c"]
  };
  _assign(o1, {
    b: "d",
    e: "f",
    g: ["h"]
  });
  expect(o1).toEqual({
    b: ["c", "d"],
    e: ["f"],
    g: ["h"]
  });
});
