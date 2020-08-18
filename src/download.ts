import net from 'net';
import { Buffer } from 'buffer';
import getPeers from './tracker';
import { torrentType, peerType } from './interfaces';
import messages from './messages';

const downloadTorrent = (torrent: torrentType): void => {
  getPeers(torrent, (peers: peerType[]) => {
    peers.forEach((peer) => downloadPeer(peer, torrent));
  });
};

const downloadPeer = (peer: peerType, torrent: torrentType) => {
  const socket = new net.Socket();
  socket.on('error', console.log);
  socket.connect(peer.port, peer.ip, () => {
    socket.write(messages.buildHandshake(torrent));
  });
  onWholeMsg(socket, (data: Buffer) => {
    dataHandler(data, socket);
  });
};

const dataHandler = (data: Buffer, socket: net.Socket) => {
  if (isHandshake(data)) socket.write(messages.buildInterested());
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

export default downloadTorrent;
