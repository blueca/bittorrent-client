import net from 'net';
import fs from 'fs';
import { Buffer } from 'buffer';
import getPeers from './tracker';
import { torrentType, peerType, requestPayload } from './interfaces';
import messages from './messages';
import Pieces from './Pieces';
import Queue from './Queue';

const downloadTorrent = (torrent: torrentType, filepath: string): void => {
  getPeers(torrent, (peers: peerType[]) => {
    const pieces = new Pieces(torrent);

    fs.open(filepath, 'w', (err, file) => {
      // eslint-disable-next-line no-console
      if (err) console.log(err);
      peers.forEach((peer) => downloadPeer(peer, torrent, pieces, file));
    });
  });
};

const downloadPeer = (
  peer: peerType,
  torrent: torrentType,
  pieces: Pieces,
  file: number
) => {
  const socket = new net.Socket();
  // eslint-disable-next-line no-console
  socket.on('error', console.log);
  socket.connect(peer.port, peer.ip, () => {
    socket.write(messages.buildHandshake(torrent));
  });

  const queue = new Queue(torrent);
  onWholeMsg(socket, (data: Buffer) => {
    dataHandler(data, socket, pieces, queue, torrent, file);
  });
};

const dataHandler = (
  data: Buffer,
  socket: net.Socket,
  pieces: Pieces,
  queue: Queue,
  torrent: torrentType,
  file: number
) => {
  if (isHandshake(data)) {
    socket.write(messages.buildInterested());
  } else {
    const message = messages.parseMessage(data);

    if (message.id === 0) chokeHandler(socket);
    if (message.id === 1) unchokeHandler(socket, pieces, queue);
    if (message.id === 4)
      haveHandler(message.payload as Buffer, socket, pieces, queue);
    if (message.id === 5)
      bitfieldHandler(message.payload as Buffer, socket, pieces, queue);
    if (message.id === 7)
      pieceHandler(
        socket,
        pieces,
        queue,
        torrent,
        file,
        message.payload as requestPayload
      );
  }
};

const isHandshake = (data: Buffer) => {
  return (
    data.length === data.readUInt8(0) + 49 &&
    data.toString('utf8', 1) === 'BitTorrent protocol'
  );
};

const onWholeMsg = (socket: net.Socket, cb: CallableFunction) => {
  let savedBuffer = Buffer.alloc(0);
  let handshake = true;

  socket.on('data', (receivedBuffer) => {
    const msgLen = () =>
      handshake
        ? savedBuffer.readUInt8(0) + 49
        : savedBuffer.readInt32BE(0) + 4;
    savedBuffer = Buffer.concat([savedBuffer, receivedBuffer]);

    while (savedBuffer.length >= 4 && savedBuffer.length >= msgLen()) {
      cb(savedBuffer.slice(0, msgLen()));
      savedBuffer = savedBuffer.slice(msgLen());
      handshake = false;
    }
  });
};

const chokeHandler = (socket: net.Socket) => {
  socket.end();
};

const unchokeHandler = (socket: net.Socket, pieces: Pieces, queue: Queue) => {
  queue.choked = false;
  requestPiece(socket, pieces, queue);
};

const haveHandler = (
  payload: Buffer,
  socket: net.Socket,
  pieces: Pieces,
  queue: Queue
) => {
  const pieceIndex = payload.readUInt32BE(0);
  const queueEmpty = queue.length() === 0;

  queue.queue(pieceIndex);

  if (queueEmpty) {
    requestPiece(socket, pieces, queue);
  }
};

const bitfieldHandler = (
  payload: Buffer,
  socket: net.Socket,
  pieces: Pieces,
  queue: Queue
) => {
  const queueEmpty = queue.length() === 0;

  payload.forEach((byte, index) => {
    for (let i = 0; i < 8; i++) {
      if (byte % 2) queue.queue(index * 8 + 7 - i);
      byte = Math.floor(byte / 2);
    }
  });

  if (queueEmpty) requestPiece(socket, pieces, queue);
};

const pieceHandler = (
  socket: net.Socket,
  pieces: Pieces,
  queue: Queue,
  torrent: torrentType,
  file: number,
  pieceResp: requestPayload
) => {
  // eslint-disable-next-line no-console
  console.log(pieceResp);
  pieces.addReceived(pieceResp);

  const offset =
    pieceResp.index * torrent.info['piece length'] + pieceResp.begin;

  const pieceRespBlock = pieceResp.block as Buffer;

  fs.write(file, pieceRespBlock, 0, pieceRespBlock.length, offset, (err) => {
    // eslint-disable-next-line no-console
    console.log(err);
  });

  if (pieces.isDone()) {
    // eslint-disable-next-line no-console
    console.log('>>> COMPLETE <<<');
    socket.end();
    // eslint-disable-next-line no-console
    fs.close(file, (err) => console.log(err));
  } else {
    requestPiece(socket, pieces, queue);
  }
};

const requestPiece = (socket: net.Socket, pieces: Pieces, queue: Queue) => {
  if (queue.choked) return null;

  while (queue.length()) {
    const pieceBlock = queue.deQueue() as requestPayload;

    if (pieces.needed(pieceBlock)) {
      socket.write(messages.buildRequest(pieceBlock));
      pieces.addRequested(pieceBlock);
      break;
    }
  }
};

export default downloadTorrent;
