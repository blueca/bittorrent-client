import fs from 'fs/promises';
import bencode from 'bencode';
import crypto from 'crypto';
import { Buffer } from 'buffer';
import { torrentType } from './interfaces';

const BLOCK_LEN: number = Math.pow(2, 14);

const open = (filepath: string): Promise<torrentType> => {
  return fs
    .readFile(filepath)
    .then((buffer) => {
      return bencode.decode(buffer);
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
  const buffer = Buffer.allocUnsafe(16);

  buffer.writeBigInt64BE(BigInt(size));

  return buffer;
};

const infoHash = (torrent: torrentType): Buffer => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash('sha1').update(info).digest();
};

const pieceLen = (torrent: torrentType, pieceIndex: number): number => {
  const totalLen = parseInt(size(torrent).readBigInt64BE().toString());
  const pieceLen = torrent.info['piece length'];
  const lastPieceLen = totalLen % pieceLen;
  const lastPieceIndex = Math.floor(totalLen / pieceLen);

  return lastPieceIndex === pieceIndex ? lastPieceLen : pieceLen;
};

const blocksPerPiece = (torrent: torrentType, pieceIndex: number): number => {
  const pieceLength = pieceLen(torrent, pieceIndex);

  return Math.ceil(pieceLength / BLOCK_LEN);
};

const blockLen = (
  torrent: torrentType,
  pieceIndex: number,
  blockIndex: number
): number => {
  const pieceLength = pieceLen(torrent, pieceIndex);
  const lastPieceLength = pieceLength % BLOCK_LEN;
  const lastPieceIndex = Math.floor(pieceLength / BLOCK_LEN);

  return blockIndex === lastPieceIndex ? lastPieceLength : BLOCK_LEN;
};

export default {
  open,
  size,
  infoHash,
  BLOCK_LEN,
  pieceLen,
  blocksPerPiece,
  blockLen
};
