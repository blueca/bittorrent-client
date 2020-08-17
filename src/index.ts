import getPeers from './tracker';
import torrentParser from './torrent-parser';

const run = async () => {
  try {
    const torrent = await torrentParser.open('puppy.torrent');

    getPeers(torrent, (peers: number[]) => {
      console.log('>> peers: ', peers);
    });
  } catch (err) {
    console.log(err);
  }
};

run();
