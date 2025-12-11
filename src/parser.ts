import { StreamLineReader } from "./stream-line-reader";

const NAG_NULL = 0;

/**
 * A good move. Can also be indicated by ``!`` in PGN notation.
 */
const NAG_GOOD_MOVE = 1;

/**
 * A mistake. Can also be indicated by ``?`` in PGN notation.
 */
const NAG_MISTAKE = 2;

/**
 * A brilliant move. Can also be indicated by ``!!`` in PGN notation.
 */
const NAG_BRILLIANT_MOVE = 3;

/**
 * A blunder. Can also be indicated by ``??`` in PGN notation.
 */
const NAG_BLUNDER = 4;

/**
 * A speculative move. Can also be indicated by ``!?`` in PGN notation.
 */
const NAG_SPECULATIVE_MOVE = 5;

/**
 * A dubious move. Can also be indicated by ``?!`` in PGN notation.
 */
const NAG_DUBIOUS_MOVE = 6;

const NAG_FORCED_MOVE = 7;
const NAG_SINGULAR_MOVE = 8;
const NAG_WORST_MOVE = 9;
const NAG_DRAWISH_POSITION = 10;
const NAG_QUIET_POSITION = 11;
const NAG_ACTIVE_POSITION = 12;
const NAG_UNCLEAR_POSITION = 13;
const NAG_WHITE_SLIGHT_ADVANTAGE = 14;
const NAG_BLACK_SLIGHT_ADVANTAGE = 15;
const NAG_WHITE_MODERATE_ADVANTAGE = 16;
const NAG_BLACK_MODERATE_ADVANTAGE = 17;
const NAG_WHITE_DECISIVE_ADVANTAGE = 18;
const NAG_BLACK_DECISIVE_ADVANTAGE = 19;

const NAG_WHITE_ZUGZWANG = 22;
const NAG_BLACK_ZUGZWANG = 23;

const NAG_WHITE_MODERATE_COUNTERPLAY = 132;
const NAG_BLACK_MODERATE_COUNTERPLAY = 133;
const NAG_WHITE_DECISIVE_COUNTERPLAY = 134;
const NAG_BLACK_DECISIVE_COUNTERPLAY = 135;
const NAG_WHITE_MODERATE_TIME_PRESSURE = 136;
const NAG_BLACK_MODERATE_TIME_PRESSURE = 137;
const NAG_WHITE_SEVERE_TIME_PRESSURE = 138;
const NAG_BLACK_SEVERE_TIME_PRESSURE = 139;

const NAG_NOVELTY = 146;

const TAG_REGEX = /^\[([A-Za-z0-9][A-Za-z0-9_+#=:-]*)\s+\"([^\r]*)\"\]\s*$/;
const TAG_NAME_REGEX = /^[A-Za-z0-9][A-Za-z0-9_+#=:-]*\Z/;

const MOVETEXT_REGEX = new RegExp(
	'(' +
		'[NBKRQ]?[a-h]?[1-8]?[-x]?[a-h][1-8](?:=?[nbrqkNBRQK])?' + // standard moves
		'|[PNBRQK]?@[a-h][1-8]' + // drops (crazyhouse)
		'|--' + // placeholder
		'|Z0' +
		'|0000' +
		'|@@@@' +
		'|O-O(?:-O)?' + // castling long
		'|0-0(?:-0)?' + // castling long misspelled
		')' +
		'|(\\{.*)' + // comments {...}
		'|(;.*)' + // comments starting with ;
		'|(\\$[0-9]+)' + // NAGs
		'|(\\()' + // (
		'|(\\))' + // )
		'|(\\*|1-0|0-1|1/2-1/2)' + // game result
		'|([?!]{1,2})', // move annotation
	's',
);

const SKIP_MOVETEXT_REGEX = /;|\{|\}/;

const CLOCK_REGEX =
	/(?<prefix>\s?)\[%clk\s(?<hours>\d+):(?<minutes>\d+):(?<seconds>\d+(?:\.\d*)?)\](?<suffix>\s?)/;
const EMT_REGEX =
	/(?<prefix>\s?)\[%emt\s(?<hours>\d+):(?<minutes>\d+):(?<seconds>\d+(?:\.\d*)?)\](?<suffix>\s?)/;

const EVAL_REGEX = new RegExp(
	'(?<prefix>\\s?)' +
		'\\[%eval\\s(?:' +
		'#(?<mate>[+-]?\\d+)' +
		'|(?<cp>[+-]?(?:\\d{0,10}\\.\\d{1,2}|\\d{1,10}\\.?))' +
		')' +
		'(?:,(?<depth>\\d+))?' +
		'\\]' +
		'(?<suffix>\\s?)',
);

const ARROWS_REGEX = new RegExp(
	'(?<prefix>\\s?)' +
		'\\[%((?:csl|cal))\\s(?<arrows>' +
		'[RGYB][a-h][1-8](?:[a-h][1-8])?' +
		'(?:,[RGYB][a-h][1-8](?:[a-h][1-8])?)*' +
		')\\]' +
		'(?<suffix>\\s?)',
);

export class Parser {
	private lineReader: StreamLineReader;

	constructor(input: string | Uint8Array | ReadableStream<Uint8Array>) {
		let stream: ReadableStream<Uint8Array>;

		if (typeof input === 'string') {
			const bytes = new TextEncoder().encode(input);
			stream = Parser.fromUint8Array(bytes);
		} else if (input instanceof Uint8Array) {
			stream = Parser.fromUint8Array(input);
		} else if (Parser.isReadableStream(input)) {
			stream = input;
		} else {
			throw new Error(
				'Parser input must be a string, a Uint8Array, or a ReadableStream<Uint8Array>',
			);
		}

		this.lineReader = new StreamLineReader(stream);
	}

	private static fromUint8Array(data: Uint8Array): ReadableStream<Uint8Array> {
		return new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(data);
				controller.close();
			},
		});
	}

	private static isReadableStream(
		obj: unknown,
	): obj is ReadableStream<Uint8Array> {
		return (
			obj &&
			typeof obj === 'object' &&
			Object.prototype.hasOwnProperty.call(obj, 'getReader') &&
			typeof obj['getReader'] === 'function'
		);
	}
}
