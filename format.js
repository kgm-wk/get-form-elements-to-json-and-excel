const input = require('./tmp/input.json');
const _ = require('lodash');
const fs = require('fs');
const removeEmptyLines = require("remove-blank-lines");

const outputDir = './tmp';
if (!fs.existsSync(outputDir)){
  fs.mkdirSync(outputDir);
}

const formatedFormElements = _
  .chain(input)
  .reduce((acc, cur) => {
    if (!cur.name && !cur.id) {
      return acc;
    }
    return [
      ...acc,
      {
        ele: `[name="${cur.name}"]#${cur.id}`,
        name: cur.name,
        type: cur.type,
        tag: cur.tag_name,
        val: cur.ttl
      }
    ]
  }, [])
  .uniqBy('name')
  .groupBy(item => `${item.tag}_${item.type}`)
  .reduce((acc, cur, key) => {
    return `${acc}\n${key}: [` + _.reduce(cur, (accumulator, item, itemKey) => {
      return `${accumulator}\n      {
        ele: '${item.ele}',
        ${item.type === 'text' || item.tag === 'textarea' ? `val: '${item.val}',` : ''}
      },`;
    }, '') + '\n],';
  }, '')
  .replace(/^\s{4}/gm, '')

fs.writeFileSync('tmp/formated_form_elements.js', `const formatedFormElements = {\n${removeEmptyLines(formatedFormElements)}\n}`);