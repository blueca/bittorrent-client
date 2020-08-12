import fs from 'fs';
import bencoder from 'bencoder';
import getPeers from './tracker';

const torrent = fs.promises
  .readFile('puppy.torrent')
  .then((buffer) => {
    const torrentDetails = bencoder.decode(buffer, 'utf8');

    getPeers(torrentDetails, (peers: number[]) => {
      console.log('>> peers: ', peers);
    });
  })
  .catch((err) => {
    throw err;
  });
