import { torrentType, pieceBlockType } from './interfaces';
import torrentParser from './torrent-parser';

class Queue {
  private _torrent: torrentType;
  private _queue: pieceBlockType[];
  public choked: boolean;

  constructor(torrent: torrentType) {
    this._torrent = torrent;
    this._queue = [];
    this.choked = true;
  }

  queue(pieceIndex: number): void {
    const nBlocks = torrentParser.blocksPerPiece(this._torrent, pieceIndex);
    for (let i = 0; i < nBlocks; i++) {
      const pieceBlock = {
        index: pieceIndex,
        begin: i * torrentParser.BLOCK_LEN,
        length: torrentParser.blockLen(this._torrent, pieceIndex, i)
      };
      this._queue.push(pieceBlock);
    }
  }

  deQueue(): pieceBlockType | undefined {
    return this._queue.shift();
  }

  peek(): pieceBlockType {
    return this._queue[0];
  }

  length(): number {
    return this._queue.length;
  }
}

export default Queue;
