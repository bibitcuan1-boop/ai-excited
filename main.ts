// ai-excited-01 — "The Koi Who Swam Out" for @bibit-cuan.
//
// main.ts copies ./entry.png to $MAKEFUN_OUTPUT_DIR/entry.png
// (default /output). Node 22, standard library only.
//
// Deterministic by construction: a straight byte-for-byte copy and
// nothing else — no network, no clock, no randomness — so repeated
// runs produce identical output bytes. Before copying it checks the
// source is a real PNG of the expected 1024x1024 size, reading the
// width and height out of the IHDR chunk.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const entrySrc = join(dirname(fileURLToPath(import.meta.url)), "entry.png");
const entryDst = join(outDir, "entry.png");

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const bytes = readFileSync(entrySrc);
if (bytes.length < 33 || !bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("entry.png is missing or is not a valid PNG file");
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width !== 1024 || height !== 1024) {
  throw new Error(`entry.png must be 1024x1024, got ${width}x${height}`);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(entrySrc, entryDst);
console.log(`Wrote ${entryDst} (${bytes.length} bytes, ${width}x${height})`);
