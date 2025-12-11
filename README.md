# streaming-pgn-parser

Read collections of chess games in Portable Game Notation PGN.

- [streaming-pgn-parser](#streaming-pgn-parser)
  - [Status](#status)
  - [Installation](#installation)
  - [Description](#description)
  - [Reporting Bugs](#reporting-bugs)
  - [Copyright](#copyright)

## Status

Work in progress. Don't believe anything you read in this document.

## Installation

```
pnpm install streaming-pgn-parser
```

Or use `npm`, `yarn`, `bun`, ...

## Description

```TypeScript
import { PGNParser } from 'streaming-pgn-parser';

// Read from a string.
let pgn = new PGNParser('[Event "?"]...');

// Read from a URL.
const response = fetch('http://www.example.com/example.pgn');
let pgn = new PGNParser(response.body);

// Read from a file (not possible in the browser).
import * fs from 'node:fs/promises';

const fh = await open('example.pgn');
const stream = fh.ReadableWebStream();
let pgn = new PGNParse(stream);
```

## Reporting Bugs

Please report bugs at https://github.com/gflohr/streaming-pgn-parser/issues.

## Copyright

Copyright (C) 2025 Guido Flohr <guido.flohr@cantanea.com>, all
rights reserved.

This is free software available under the terms of the
[WTFPL](http://www.wtfpl.net/).
