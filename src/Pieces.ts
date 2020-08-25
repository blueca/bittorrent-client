class Pieces {
  private _requested: boolean[];
  private _received: boolean[];

  constructor(size: number) {
    this._requested = new Array(size).fill(false);
    this._received = new Array(size).fill(false);
  }

  addRequested(pieceIndex: number): void {
    this._requested[pieceIndex] = true;
  }

  addReceived(pieceIndex: number): void {
    this._received[pieceIndex] = true;
  }

  needed(pieceIndex: number): boolean {
    if (this._requested.every((elem) => elem === true)) {
      this._requested = this._received.slice();
    }

    return !this._requested[pieceIndex];
  }

  isDone(): boolean {
    return this._received.every((elem) => elem === true);
  }
}

export default Pieces;
