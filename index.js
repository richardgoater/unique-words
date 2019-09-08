const fs = require('fs');
const path = require('path');
const es = require('event-stream');
const mapLimit = require('promise-map-limit');

const dir = process.argv[2];
const pattern = process.argv[3];
const patternregx = new RegExp(pattern);

const files = fs.readdirSync(dir);
return mapLimit(files, 1, file => {
  return new Promise((resolve, reject) => {
    if (patternregx.test(file)) {
      const uniqueWords = new Set();
      fs.createReadStream(path.join(dir, file), 'utf8')
        .pipe(es.split()) // new lines considered to be word breaks
        .pipe(es.through(line => {
          const words = line.split(' ');
          for (const word of words) {
            uniqueWords.add(word);
          }
        }))
        .on('end', () => {
          console.log(`${file}: ${uniqueWords.size}`);
          resolve();
        })
        .on('error', reject);
    } else {
      resolve();
    }
  })
})
.catch(error => {
  console.error(error);
  process.exit(1);
});
