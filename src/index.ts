import torrentParser from './torrent-parser';
import downloadTorrent from './download';

const run = async () => {
  const torrent = await torrentParser.open(process.argv[2]).catch((err) => {
    console.log(err);
  });

  if (torrent) downloadTorrent(torrent);
};

run();
