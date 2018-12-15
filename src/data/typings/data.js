/**
 * The functions in this file are NodeJS functions. Please call them from your
 * console:
 * $ node src/data/typings/data.js
 * */

const path = require('path');
const fs = require('fs');

/**
 * Split a string of words using a delimiter
 * */
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

function data() {
  wordsSplitter();
}

data();
