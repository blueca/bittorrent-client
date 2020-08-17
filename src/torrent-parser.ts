import fs from 'fs';
import bencoder from 'bencoder';
import crypto from 'crypto';
import { Buffer } from 'buffer';
import torrentType from './interfaces';

const open = (filepath: string): Promise<torrentType> => {
  return fs.promises
    .readFile(filepath)
    .then((buffer) => {
      return bencoder.decode(buffer, 'utf8');
    })
    .catch((err) => {
      throw err;
    });
};

const size = (torrent: torrentType): Buffer => {
  const size = torrent.info.files
    ? torrent.info.files
        .map((file) => file.length)
        .reduce((acc: number, cur: number) => acc + cur, 0)
    : torrent.info.length;

  return Buffer.from(BigInt(size).toString());
};

const infoHash = (torrent: torrentType): Buffer => {
  const info = bencoder.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};

export default { open, size, infoHash };
