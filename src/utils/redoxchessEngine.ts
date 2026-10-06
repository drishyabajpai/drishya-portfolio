class RedoxChessEngine {
  private engine: Worker | null = null;
  private onMoveCallback: ((move: string) => void) | null = null;
  private _isReady = false;

  get isReady() {
    return this._isReady;
  }

  async init() {
    return new Promise<void>((resolve) => {
      this.engine = new Worker('/redoxchess.js');

      this.engine.onmessage = (event) => {
        const message = event.data;

        if (message === 'readyok') {
          this._isReady = true;
          resolve();
        } else if (message.startsWith('bestmove')) {
          const move = message.split(' ')[1];
          if (this.onMoveCallback) {
            this.onMoveCallback(move);
          }
        }
      };

      this.send('uci');
      this.send('isready');
    });
  }

  private send(command: string) {
    if (this.engine) {
      this.engine.postMessage(command);
    }
  }

  setPosition(fen: string) {
    this.send(`position fen ${fen}`);
  }

  getBestMove(onMove: (move: string) => void, depth = 15) {
    this.onMoveCallback = onMove;
    this.send(`go depth ${depth}`);
  }

  stop() {
    this.send('stop');
  }

  quit() {
    if (this.engine) {
      this.send('quit');
      this.engine.terminate();
      this.engine = null;
    }
  }
}

export default RedoxChessEngine;
