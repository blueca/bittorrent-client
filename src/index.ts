import torrentParser from './torrent-parser';
import downloadTorrent from './download';

const run = async () => {
  // eslint-disable-next-line no-console
  const torrent = await torrentParser.open(process.argv[2]).catch(console.log);

  if (torrent) downloadTorrent(torrent, torrent.info.name);
};

run();
