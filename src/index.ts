import fs from 'fs';
import bencoder from 'bencoder';
import getPeers from './tracker';
import torrentParser from './torrent-parser';

const run = async () => {
  const torrent = await torrentParser.open('puppy.torrent');

  getPeers(torrent, (peers: number[]) => {
    console.log('>> peers: ', peers);
  });
};

run();
