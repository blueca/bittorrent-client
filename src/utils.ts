import crypto from 'crypto';
import { Buffer } from 'buffer';

let id: Buffer;

function genId(): Buffer {
  if (!id) {
    id = crypto.randomBytes(20);
    Buffer.from('-NT0001-').copy(id, 0);
  }

  return id;
}

export default genId;
