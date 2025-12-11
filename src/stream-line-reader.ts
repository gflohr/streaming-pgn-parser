export class StreamLineReader {
	private reader: ReadableStreamDefaultReader<Uint8Array>;
	private decoder = new TextDecoder();
	private buffer = '';
	private lineno = 0;
	private firstChunk = true;

	constructor(stream: ReadableStream<Uint8Array>) {
		this.reader = stream.getReader();
	}

	public get lineNumber() {
		return this.lineno;
	}

	async readLine(): Promise<string | null> {
		while (true) {
			const newlineIndex = this.buffer.indexOf('\n');
			if (newlineIndex >= 0) {
				const line = this.buffer.slice(0, newlineIndex);
				this.buffer = this.buffer.slice(newlineIndex + 1);
				++this.lineno;
				return line;
			}

			const { done, value } = await this.reader.read();
			if (done) {
				if (this.buffer.length > 0) {
					const line = this.buffer;
					this.buffer = '';
					++this.lineno;
					return line;
				} else {
					return null;
				}
			}

			let chunk = this.decoder.decode(value, { stream: true });

			// strip BOM if present in the first chunk
			if (this.firstChunk) {
				this.firstChunk = false;
				if (chunk.startsWith('\uFEFF')) {
					chunk = chunk.slice(1);
				}
			}

			this.buffer += chunk;
		}
	}

	async close() {
		await this.reader.cancel();
	}
}
