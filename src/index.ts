import fs from 'fs';
import bencoder from 'bencoder';

const torrent = fs.promises
  .readFile('puppy.torrent')
  .then((buffer) => {
    return bencoder.decode(buffer, 'utf8');
  })
  .catch((err) => {
    throw err;
  });
