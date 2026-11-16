// ai-excited-01 — entry for @bibit-cuan.
// Copies ./entry.png to $MAKEFUN_OUTPUT_DIR/entry.png (default /output).
// Node 22, standard library only. Deterministic: the output bytes are
// an exact copy of entry.png.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const entrySrc = join(dirname(fileURLToPath(import.meta.url)), "entry.png");
const entryDst = join(outDir, "entry.png");

// Validate the source image before copying: it must exist and be a PNG.
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const bytes = readFileSync(entrySrc);
if (!bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("entry.png is missing or is not a valid PNG file");
}

mkdirSync(outDir, { recursive: true });
copyFileSync(entrySrc, entryDst);
console.log(`Wrote ${entryDst}`);
