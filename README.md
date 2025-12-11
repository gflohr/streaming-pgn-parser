# chess-openings

The TypeScript library `chess-openings` can be used to read chess opening books
in Polyglot (`.bin`) format and ECO data.

It is a port of the Perl library
[Chess::Opening](https://github.com/gflohr/Chess-Opening) to TypeScript.

- [chess-openings](#chess-openings)
	- [Installation](#installation)
	- [Description](#description)
	- [Interfaces, Classes, and Types](#interfaces-classes-and-types)
		- [Interfaces](#interfaces)
			- [`Book`](#book)
		- [Classes](#classes)
			- [`Entry`](#entry)
			- [`Polyglot`](#polyglot)
			- [`ECO`](#eco)
			- [`ECOEntry`](#ecoentry)
		- [Types](#types)
			- [`Continuation`](#continuation)
	- [Reporting Bugs](#reporting-bugs)
	- [Copyright](#copyright)

## Installation

```
pnpm install chess-openings
```

Or use `npm`, `yarn`, `bun`, ...

## Description

```TypeScript
import { Book, Polyglot, ECO } from 'chess-openings';

const book: Book = new Polyglot('./books/gm2001.bin');
// Or pass a file handle.
// import * as fs from 'node:fs/promises';
// const fh = await fs.open('./books/gm2001.bin');
// const book: Book = new Polyglot(fh, 'whatever.bin');

// Required for all filesystem based opening databases.
await book.open();

const startpos = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const entry = await book.lookup(startpos);
if (!entry) throw new Error('position not found');

const continuations = entry.continuations();
for (let i = 0; i < continuations.length; ++i) {
	console.log(`continuation: ${continuations[i].move}`);
	console.log(`  weight: ${continuations[i].weight}`);
	console.log(`  learn: ${continuations[i].learn}`);
}

await book.close();

const eco: ECO = new ECO();
// ECO also implements the Book interface.
// const eco: Book = new ECO();

// A no-op.
await eco.open();

const ruy_lopez = 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1';

const ecoEntry = await eco.lookup(ruy_lopez);
// const ecoEntry = await eco.lookupSync(ruy_lopez);
if (!ecoEntry) throw new Error('position not found');

console.log(`code: ${ecoEntry.code}`); // C60
console.log(`name: ${ecoEntry.name}`); // Ruy Lopez
const continuations2 = ecoEntry.continuations; // Same as for Polyglot.
```

## Interfaces, Classes, and Types

### Interfaces

#### `Book`

* `lookup(FEN)` - returns undefined or an `Entry` (see below). You can either pass a FEN string or an EPD string (a FEN string without move numbers).

Books can use any move notation they want. The implementations that come with
this library (Polyglot and ECO) use coordinate notation.

### Classes

#### `Entry`

Gets returned by `lookup(FEN)`.

Getters and methods:

* `epd`: The EPD of the entry.
* `continuations()`: All known continuations (as a `Continuation`, see below) from that position.
* `getBestMoves()`: Returns an array of continuation moves in book notation that have the highest weight.
* `getBestMove()`: Returns the continuation move with the highest weight. If multiple moves have the same weight, a move is picked randomly.
* `pickMove()`: Pick a random move using weighted random selection based on the weight of each move.

#### `Polyglot`

The `Polyglot` class represents an opening book in Polyglot (`.bin`) format.

```TypeScript
import { Polyglot, Book } from 'chess-opening';

const book: Book = new Polyglot('books/gm2001.bin');

import * as fs from 'node:fs/promises';

const fh = await fs.open('books/gm2001.bin');
const book2: Book = new Polyglot (fh, 'gm2001.bin');
```

Implements the `Book` interface (see above). You can either instantiate it
with a filename or with a file handle, and optionally a filename to use
internally.

#### `ECO`

The class `ECO` contains an opening classification according to the
Encyclopedia of Chess Openings. The opening names and lines are identical to
those used by [Lichess](https://lichess.org).

The class implements the `Book` interface plus additional methods:

* `lookupSync(epd)`

#### `ECOEntry`

Extends the `Entry` class with additional getters:

* `code` the ECO code of the opening
* `name` the name of the opening

### Types

#### `Continuation`

Properties:

* `move`: A move as a string in book notation.
* `weight`: A weight that influences the likelihood of this move being picked.
* `learn`: An opaque numeric value with additional information.

## Reporting Bugs

Please report bugs at https://github.com/gflohr/chess-opening-ts/issues.

## Copyright

Copyright (C) 2025 Guido Flohr <guido.flohr@cantanea.com>, all
rights reserved.

This is free software available under the terms of the
[WTFPL](http://www.wtfpl.net/).
