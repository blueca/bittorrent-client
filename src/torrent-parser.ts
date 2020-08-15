import fs from 'fs';
import bencoder from 'bencoder';
import crypto from 'crypto';
import { Buffer } from 'buffer';

interface info {
  files: string[];
  length: number;
}

interface torrent {
  info: info;
}

const open = (filepath: string) => {
  return fs.promises
    .readFile(filepath)
    .then((buffer) => {
      return bencoder.decode(buffer, 'utf8');
    })
    .catch((err) => {
      throw err;
    });
};

const size = (torrent: torrent): Buffer => {
  const size = torrent.info.files
    ? torrent.info.files
        .map((file) => file.length)
        .reduce((acc: number, cur: number) => acc + cur, 0)
    : torrent.info.length;

  return Buffer.from((BigInt(size) as unknown) as string);
};

const infoHash = (torrent: torrent): Buffer => {
  const info = bencoder.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};

export default { open, size, infoHash };
