import { Buffer } from 'buffer';
import torrentParser from './torrent-parser';
import {
  torrentType,
  requestPayload,
  piecePayload,
  payloadType,
  parsedMessageType
} from './interfaces';
import genId from './utils';

const buildHandshake = (torrent: torrentType): Buffer => {
  const buffer = Buffer.alloc(68);
  buffer.writeUInt8(19, 0);
  buffer.write('BitTorrent protocol', 1);
  buffer.writeUInt32BE(0, 20);
  buffer.writeUInt32BE(0, 24);
  torrentParser.infoHash(torrent).copy(buffer, 28);
  buffer.write(genId().toString());

  return buffer;
};

const buildKeepAlive = (): Buffer => Buffer.alloc(4);

const buildChoke = (): Buffer => {
  const buffer = Buffer.alloc(5);
  buffer.writeUInt32BE(1, 0);
  buffer.writeUInt8(0, 4);

  return buffer;
};

const buildUnchoke = (): Buffer => {
  const buffer = Buffer.alloc(5);
  buffer.writeUInt32BE(1, 0);
  buffer.writeUInt8(1, 4);

  return buffer;
};

const buildInterested = (): Buffer => {
  const buffer = Buffer.alloc(5);
  buffer.writeUInt32BE(1, 0);
  buffer.writeUInt8(2, 4);

  return buffer;
};

const buildUninterested = (): Buffer => {
  const buffer = Buffer.alloc(5);
  buffer.writeUInt32BE(1, 0);
  buffer.writeUInt8(3, 4);

  return buffer;
};

const buildHave = (payload: number): Buffer => {
  const buffer = Buffer.alloc(9);
  buffer.writeUInt32BE(5, 0);
  buffer.writeUInt8(4, 4);
  buffer.writeUInt32BE(payload, 5);

  return buffer;
};

const buildBitfield = (bitfield: string): Buffer => {
  const buffer = Buffer.alloc(14);
  buffer.writeUInt32BE(bitfield.length + 1, 0);
  buffer.writeUInt8(5, 4);
  buffer.copy(buffer, 5);

  return buffer;
};

const buildRequest = (payload: requestPayload): Buffer => {
  const buffer = Buffer.alloc(17);
  buffer.writeUInt32BE(13, 0);
  buffer.writeUInt8(6, 4);
  buffer.writeUInt32BE(payload.index, 5);
  buffer.writeUInt32BE(payload.begin, 9);
  buffer.writeUInt32BE(payload.length, 13);

  return buffer;
};

const buildPiece = (payload: piecePayload): Buffer => {
  const buffer = Buffer.alloc(payload.block.length + 13);
  buffer.writeUInt32BE(payload.block.length + 9, 0);
  buffer.writeUInt8(7, 4);
  buffer.writeUInt32BE(payload.index, 5);
  buffer.writeUInt32BE(payload.begin, 9);
  payload.block.copy(buffer, 13);

  return buffer;
};

const buildCancel = (payload: requestPayload): Buffer => {
  const buffer = Buffer.alloc(17);
  buffer.writeUInt32BE(13, 0);
  buffer.writeUInt8(8, 4);
  buffer.writeUInt32BE(payload.index, 5);
  buffer.writeUInt32BE(payload.begin, 9);
  buffer.writeUInt32BE(payload.length, 13);

  return buffer;
};

const buildPort = (port: number): Buffer => {
  const buffer = Buffer.alloc(7);
  buffer.writeUInt32BE(3, 0);
  buffer.writeUInt8(9, 4);
  buffer.writeUInt16BE(port, 5);

  return buffer;
};

const parseMessage = (msg: Buffer): parsedMessageType => {
  const id = msg.length > 4 ? msg.readInt8(4) : null;
  let payload: Buffer | payloadType | null =
    msg.length > 5 ? msg.slice(5) : null;

  if (payload !== null && (id === 6 || id === 7 || id === 8)) {
    const rest = payload.slice(8);
    payload = {
      index: payload.readInt32BE(0),
      begin: payload.readInt32BE(4)
    };
    payload[id === 7 ? 'block' : 'length'] = rest;
  }

  return {
    size: msg.readInt32BE(0),
    id: id,
    payload: payload
  };
};

export default {
  buildHandshake,
  buildKeepAlive,
  buildChoke,
  buildUnchoke,
  buildInterested,
  buildUninterested,
  buildHave,
  buildBitfield,
  buildRequest,
  buildPiece,
  buildCancel,
  buildPort,
  parseMessage
};
