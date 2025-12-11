import { StreamLineReader } from './stream-line-reader';

describe('StreamLineReader', () => {
	function stringToStream(str: string): ReadableStream<Uint8Array> {
		const encoder = new TextEncoder();
		let sent = false;
		return new ReadableStream<Uint8Array>({
			pull(controller) {
				if (!sent) {
					controller.enqueue(encoder.encode(str));
					sent = true;
				} else {
					controller.close();
				}
			},
		});
	}

	it('reads lines one by one', async () => {
		const stream = stringToStream('line1\nline2\nline3\n');
		const reader = new StreamLineReader(stream);

		const line1 = await reader.readLine();
		expect(line1).toBe('line1');

		const line2 = await reader.readLine();
		expect(line2).toBe('line2');

		const line3 = await reader.readLine();
		expect(line3).toBe('line3');

		const line4 = await reader.readLine();
		expect(line4).toBeNull();

		await reader.close();
	});

	it('handles last line without newline', async () => {
		const stream = stringToStream('line1\nline2\nlastline');
		const reader = new StreamLineReader(stream);

		expect(await reader.readLine()).toBe('line1');
		expect(await reader.readLine()).toBe('line2');
		expect(await reader.readLine()).toBe('lastline');
		expect(await reader.readLine()).toBeNull();

		await reader.close();
	});

	it('returns null for empty stream', async () => {
		const stream = stringToStream('');
		const reader = new StreamLineReader(stream);

		expect(await reader.readLine()).toBeNull();

		await reader.close();
	});

	it('strips a BOM at the beginning', async () => {
		const BOM = '\uFEFF';
		const stream = stringToStream(BOM + 'line1\nline2\n');
		const reader = new StreamLineReader(stream);

		expect(await reader.readLine()).toBe('line1');
		expect(await reader.readLine()).toBe('line2');
		expect(await reader.readLine()).toBeNull();

		await reader.close();
	});
});
