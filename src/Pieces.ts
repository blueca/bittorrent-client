import torrentParser from './torrent-parser';
import { torrentType, requestPayload } from './interfaces';

class Pieces {
  private _requested: boolean[][];
  private _received: boolean[][];

  constructor(torrent: torrentType) {
    function buildPiecesArray(): boolean[][] {
      const nPieces = torrent.info.pieces.length / 20;
      const arr = new Array(nPieces).fill(null);
      return arr.map((_, index) => {
        return new Array(torrentParser.blocksPerPiece(torrent, index)).fill(
          false
        );
      });
    }
    this._requested = buildPiecesArray();
    this._received = buildPiecesArray();
  }

  addRequested(pieceBlock: requestPayload): void {
    const blockIndex = pieceBlock.begin / torrentParser.BLOCK_LEN;
    this._requested[pieceBlock.index][blockIndex] = true;
  }

  addReceived(pieceBlock: requestPayload): void {
    const blockIndex = pieceBlock.begin / torrentParser.BLOCK_LEN;
    this._received[pieceBlock.index][blockIndex] = true;
  }

  needed(pieceBlock: requestPayload): boolean {
    if (this._requested.every((blocks) => blocks.every((elem) => elem))) {
      this._requested = this._received.map((blocks) => blocks.slice());
    }

    const blockIndex = pieceBlock.begin / torrentParser.BLOCK_LEN;

    return !this._requested[pieceBlock.index][blockIndex];
  }

  isDone(): boolean {
    return this._received.every((blocks) => blocks.every((elem) => elem));
  }
}

export default Pieces;
