const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
let XLSX = require('xlsx');
const format = require('date-fns/format');
const workTime = format(new Date(), 'yyyyMMdd_HHmmss');

const urlFormat = (url) => url.replace(/:|\/|#/g, '_');
const urlList = [
  {
    path: 'https://cdn.codegrid.net/2017-testcafe/demo/1.html',
    container: 'fieldset',
    hd: 'legend'
  },
  {
    path: 'https://devexpress.github.io/testcafe/example/',
    container: 'fieldset',
    hd: 'legend',
  }
];

const outputDir = './tmp';
if (!fs.existsSync(outputDir)){
  fs.mkdirSync(outputDir);
}

urlList.forEach((urlItem) => {
  const url = urlItem.path;
  const container = urlItem.container;
  const hd = urlItem.hd;

  const fileJson = `./${outputDir}/${urlFormat(url)}_${workTime}.json`;
  const fileExcel = `./${outputDir}/${urlFormat(url)}_${workTime}.xlsx`;

  axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
    },
  })
  .then((response) => {
    const $ = cheerio.load(response.data);
    const data = [];
    $(container).each((i, ele) => {
      $(ele).find('input, textarea, select').each((index, element) => {
        if ($(element).attr('type') === 'hidden') {
          return;
        }
        data.push({
          'ttl': $(ele).find(hd).text(),
          'tag_name': $(element).prop('tagName').toLowerCase(),
          ...$(element).attr()
        })
      });
    });
    fs.writeFileSync(fileJson, JSON.stringify(data, null, 2));
  })
  .then(() => {
    const json = require(fileJson)
    let exportBook = XLSX.utils.book_new()
    let jsonExportSheet = XLSX.utils.json_to_sheet(json)
    XLSX.utils.book_append_sheet(exportBook, jsonExportSheet, 'シート名')
    XLSX.writeFile(exportBook, fileExcel)
  })
})