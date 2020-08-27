import dgram from 'dgram';
import { Buffer } from 'buffer';
import { parse } from 'url';
import crypto from 'crypto';
import genId from './utils';
import torrentParser from './torrent-parser';
import { torrentType } from './interfaces';

const getPeers = (torrent: torrentType, cb: CallableFunction): void => {
  const socket = dgram.createSocket('udp4');
  const url: string = torrent.announce.toString();

  udpSend(socket, buildConnReq(), url);

  socket.on('message', (response) => {
    if (respType(response) === 'connect') {
      const connResp = parseConnResp(response);
      const announceReq = buildAnnounceReq(connResp.connectionId, torrent);

      udpSend(socket, announceReq, url);
    } else if (respType(response) === 'announce') {
      const announceResp = parseAnnounceResp(response);

      cb(announceResp.peers);
    }
  });
};

const udpSend = (
  socket: dgram.Socket,
  message: Buffer,
  url: string,
  cb = () => {
    return null;
  }
) => {
  const parsedUrl = parse(url);

  if (!parsedUrl.port || !parsedUrl.hostname) throw 'url missing properties';
  socket.send(
    message,
    0,
    message.length,
    parseInt(parsedUrl.port),
    parsedUrl.hostname,
    cb
  );
};

const respType = (resp: Buffer): string => {
  const action = resp.readUInt32BE(0);
  if (action === 0) return 'connect';
  if (action === 1) return 'announce';
  throw 'invalid response';
};

const buildConnReq = () => {
  const buffer = Buffer.alloc(16);

  buffer.writeUInt32BE(0x417, 0);
  buffer.writeUInt32BE(0x27101980, 4);
  buffer.writeUInt32BE(0, 8);
  crypto.randomBytes(4).copy(buffer, 12);

  return buffer;
};

const parseConnResp = (resp: Buffer) => {
  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    connectionId: resp.slice(8)
  };
};

const buildAnnounceReq = (
  connId: Buffer,
  torrent: torrentType,
  port = 6881
) => {
  const buffer = Buffer.allocUnsafe(98);

  connId.copy(buffer, 0);
  buffer.writeUInt32BE(1, 8);
  crypto.randomBytes(4).copy(buffer, 12);
  torrentParser.infoHash(torrent).copy(buffer, 16);
  genId().copy(buffer, 36);
  Buffer.alloc(8).copy(buffer, 56);
  torrentParser.size(torrent).copy(buffer, 64);
  Buffer.alloc(8).copy(buffer, 72);
  buffer.writeUInt32BE(0, 80);
  buffer.writeUInt32BE(0, 84);
  crypto.randomBytes(4).copy(buffer, 88);
  buffer.writeInt32BE(-1, 92);
  buffer.writeUInt16BE(port, 96);

  return buffer;
};

const parseAnnounceResp = (resp: Buffer) => {
  const group = (iterable: Buffer, groupSize: number) => {
    const groups = [];
    for (let i = 0, len = iterable.length; i < len; i += groupSize) {
      groups.push(iterable.slice(i, i + groupSize));
    }
    return groups;
  };

  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    leechers: resp.readUInt32BE(8),
    seeders: resp.readUInt32BE(12),
    peers: group(resp.slice(20), 6).map((address) => {
      return {
        ip: address.slice(0, 4).join('.'),
        port: address.readUInt16BE(4)
      };
    })
  };
};

export default getPeers;
