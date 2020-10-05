# CLI Bittorrent Client

A very simple CLI bittorrent client, built for the purpose of familiarising myself with TypeScript. Largely based on the very detailed bittorrent specification available at https://wiki.theory.org/index.php/BitTorrentSpecification.

## Interesting Aspects

- My first real foray into TypeScript
- Reading/writing to and from buffers
- Using sockets

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

- Node v14

### Installing

Clone repo, install dependencies and open project:

```
git clone https://github.com/blueca/bittorrent-client
cd bittorrent-client
npm install
code .
```

### Use

```
npm start example.torrent
```

### Limitations

As a very simple client there is of course only limited functionality, for example:

- Only accepts torrents with an announce url using the udp protocol
- Download functionality only, no uploading of pieces to peers
- No functionality to pause/resume download - once it's started it will continue until either the download is complete or the CLI is closed
- Currently only works for torrents containing single files - anything containing multiple files/directories will not work properly
- Pieces are downloaded sequentially, there is no optimisation for efficiency

This gives plenty of avenues for improvement in future, but as a small test project to get to grips with TypeScript is has more than served its purpose.
