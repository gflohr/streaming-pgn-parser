export class StreamLineReader {
	private reader: ReadableStreamDefaultReader<Uint8Array>;
	private decoder = new TextDecoder();
	private buffer = '';

	constructor(stream: ReadableStream<Uint8Array>) {
		this.reader = stream.getReader();
	}

	async readLine(): Promise<string | null> {
		while (true) {
			const newlineIndex = this.buffer.indexOf('\n');
			if (newlineIndex >= 0) {
				const line = this.buffer.slice(0, newlineIndex);
				this.buffer = this.buffer.slice(newlineIndex + 1);
				return line;
			}

			const { done, value } = await this.reader.read();
			if (done) {
				if (this.buffer.length > 0) {
					const line = this.buffer;
					this.buffer = '';
					return line;
				} else {
					return null;
				}
			}

			this.buffer += this.decoder.decode(value, { stream: true });
		}
	}

	async close() {
		await this.reader.cancel();
	}
}
