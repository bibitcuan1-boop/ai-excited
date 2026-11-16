// The Panda Who Climbed Out — ai-excited-01, entered as @bibit-cuan.
//
// The picture is the whole entry: a giant panda climbing out of a bamboo
// painting in a moonlit museum, with a child's note taped to the floor.
// This file is only the courier. It reads entry.png, makes sure it is
// really the 1024x1024 PNG it claims to be, and places an exact copy at
// $MAKEFUN_OUTPUT_DIR/entry.png. It invents nothing at run time: no clock,
// no network, no randomness — the same input always produces the same
// output bytes.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const picture = join(dirname(fileURLToPath(import.meta.url)), "entry.png");

function targetDir(): string {
  const env = process.env.MAKEFUN_OUTPUT_DIR;
  return env !== undefined && env.length > 0 ? env : "/output";
}

// The eight bytes every PNG begins with, and the shape of the header
// chunk that follows them: length (4), the letters IHDR (4), then the
// thirteen header bytes, width and height first.
const MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const WANTED = 1024;

function complain(why: string): never {
  throw new Error(`entry.png is not usable: ${why}`);
}

// The CRC32 of a PNG chunk covers its type letters plus its data, and is
// stored in the four bytes after the data. Recomputing it catches a
// header that was edited by hand after the picture was made.
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(chunk: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of chunk) crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function inspect(bytes: Buffer): void {
  if (bytes.length < 33) complain("shorter than a PNG header");
  if (!bytes.subarray(0, 8).equals(MAGIC)) complain("bad PNG signature");
  if (bytes.toString("ascii", 12, 16) !== "IHDR") complain("first chunk is not IHDR");
  const wide = bytes.readUInt32BE(16);
  const tall = bytes.readUInt32BE(20);
  if (wide !== WANTED || tall !== WANTED) {
    complain(`should be ${WANTED}x${WANTED}, is ${wide}x${tall}`);
  }
  const stored = bytes.readUInt32BE(29);
  if (crc32(bytes.subarray(12, 29)) !== stored) {
    complain("IHDR checksum does not match its contents");
  }
}

if (!existsSync(picture)) complain("missing from the repository");
const bytes = readFileSync(picture);
inspect(bytes);

const dir = targetDir();
mkdirSync(dir, { recursive: true });
const placed = join(dir, "entry.png");
copyFileSync(picture, placed);

// Read the copy back and check it against the original, byte for byte.
const again = readFileSync(placed);
if (again.length !== bytes.length || !again.equals(bytes)) {
  complain("the delivered copy differs from the source");
}
const { size } = statSync(placed);
console.log(`delivered entry.png (${WANTED}x${WANTED}, ${size} bytes) to ${placed}`);
