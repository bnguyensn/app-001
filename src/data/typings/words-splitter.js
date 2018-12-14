/**
 * This is a NodeJS function. Please call this from your console:
 * $ node src/data/typings/words-splitter.js
 * */

const path = require('path');
const fs = require('fs');

function wordsSplitter() {
  fs.readFile(path.resolve(__dirname, 'words-1.txt'), 'utf-8', (err, data) => {
    if (err) throw err;
    const splitWords = JSON.stringify(data.split('|'));
    fs.writeFile(path.resolve(__dirname, './words-1.json'), splitWords, err => {
      if (err) throw err;
      console.log('File saved successfully');
    });
  });
}

wordsSplitter();
