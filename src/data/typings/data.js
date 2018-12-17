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
      console.log('Words file saved successfully');
    });
  });
}

/**
 * Generate sample JSON data file
 * */
function generateSampleData() {
  fs.readFile(path.resolve(__dirname, 'words-1.json'), 'utf-8', (err, data) => {
    if (err) throw err;

    const words = JSON.parse(data);

    // Generate data for a set of random words
    const d = [];
    const p = [];
    for (let i = 0; i < 10; i++) {
      // Look for a random, unpicked array item
      let n;
      do {
        n = Math.floor(Math.random() * words.length);
      } while (p.includes(n));
      p.push(n);

      // Create the datum
      d.push({
        id: i,
        text: words[n],
        posX: 0,
        posY: 0,
      });
    }

    // Write data to JSON file
    fs.writeFile(
      path.resolve(__dirname, './sample.json'),
      JSON.stringify(d),
      err => {
        if (err) throw err;
        console.log('Sample JSON data file saved successfully');
      },
    );
  });
}

function data() {
  generateSampleData();
}

data();
