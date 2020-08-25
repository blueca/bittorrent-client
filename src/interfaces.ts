interface file {
  length: number;
  md5sum?: string;
  path: string[];
}

interface info {
  // fields common to both single file and multiple files mode
  'piece length': number;
  pieces: string;
  private?: number;
  // name field refers to filename/directory name, depending on single file or multiple files mode
  name: string;
  // fields used for single file mode
  length: number;
  md5sum?: string;
  // fields used for multiple files mode
  files: file[];
}

interface torrentType {
  info: info;
  announce: string;
  'announce-list'?: string[][];
  'creation date'?: number;
  comment?: string;
  'created by'?: string;
  encoding?: string;
}

interface peerType {
  ip: string;
  port: number;
}

interface requestPayload {
  index: number;
  begin: number;
  length: number;
}

interface piecePayload {
  index: number;
  begin: number;
  block: any;
}

interface payloadType {
  index: number;
  begin: number;
  block?: Buffer;
  length?: Buffer;
}

interface parsedMessageType {
  size: number;
  id: number | null;
  payload: payloadType | Buffer | null;
}

interface queueType {
  choked: boolean;
  queue: number[];
}

export {
  torrentType,
  peerType,
  requestPayload,
  piecePayload,
  payloadType,
  parsedMessageType,
  queueType
};
