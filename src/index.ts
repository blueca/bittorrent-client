import getPeers from './tracker';
import torrentParser from './torrent-parser';

interface peer {
  ip: string;
  port: number;
}

const run = async () => {
  const torrent = await torrentParser.open('boat.torrent').catch((err) => {
    console.log(err);
  });

  if (torrent) {
    getPeers(torrent, (peers: peer[]) => {
      console.log('>> peers: ', peers);
    });
  }
};

run();
