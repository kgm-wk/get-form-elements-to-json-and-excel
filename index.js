const requestPromise = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
let XLSX = require('xlsx');
const format = require('date-fns/format');
const workTime = format(new Date(), 'yyyyMMdd_HHmmss');

const urlFormat = (url) => url.replace(/:|\/|#/g, '_');
const urls = [
  'https://cdn.codegrid.net/2017-testcafe/demo/1.html',
  'http://example.com/example'
];

const outputDir = './tmp';
if (!fs.existsSync(outputDir)){
  fs.mkdirSync(outputDir);
}

urls.forEach((url) => {
  const fileJson = `./${outputDir}/${urlFormat(url)}_${workTime}.json`;
  const fileExcel = `./${outputDir}/${urlFormat(url)}_${workTime}.xlsx`;

  requestPromise.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
    },
    transform: (rawHtml) => {
      return cheerio.load(rawHtml);
    }
  })
  .then(($) => {
    const data = []
    $('input, textarea, select').each((index, element) => {
      if ($(element).attr('type') === 'hidden') {
        return;
      }
      data.push({
        'tag_name': $(element).prop('tagName').toLowerCase(),
        ...$(element).attr()
      })
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