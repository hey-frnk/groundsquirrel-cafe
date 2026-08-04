import fs from "fs";

/**
 * Reads the pixel dimensions out of an image file header at build time.
 *
 * The journal pinboard lays covers out in masonry columns at their natural
 * aspect ratio, so the browser has to reserve the right height *before* the
 * image arrives — otherwise every column reflows as the photos load. Next's
 * <Image> gets this from a static import, which a CMS-driven path string can't
 * be, so the few header bytes are parsed here instead of pulling in a
 * dependency for it.
 *
 * Only the formats the content folder actually uses are understood (JPEG, PNG,
 * WebP); anything else — or a truncated/odd file — returns undefined, and the
 * caller falls back to rendering without an intrinsic size.
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

// Enough for a header plus a generous EXIF block with an embedded thumbnail,
// without reading whole multi-megabyte photos.
const HEADER_BYTES = 256 * 1024;

function readHead(file: string): Buffer | undefined {
  let fd: number | undefined;
  try {
    fd = fs.openSync(file, "r");
    const buf = Buffer.alloc(HEADER_BYTES);
    const read = fs.readSync(fd, buf, 0, HEADER_BYTES, 0);
    return buf.subarray(0, read);
  } catch {
    return undefined;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function png(buf: Buffer): ImageDimensions | undefined {
  // 8-byte signature, then the IHDR chunk whose data starts at byte 16.
  if (buf.length < 24) return undefined;
  if (buf.readUInt32BE(0) !== 0x89504e47) return undefined;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpeg(buf: Buffer): ImageDimensions | undefined {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return undefined;

  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset++; // resync past padding between segments
      continue;
    }
    const marker = buf[offset + 1];
    // Standalone markers carry no length field.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return undefined; // end of header

    const length = buf.readUInt16BE(offset + 2);
    // A start-of-frame marker holds the size: precision, height, width.
    const isSOF =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSOF) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    if (length < 2) return undefined;
    offset += 2 + length;
  }
  return undefined;
}

function webp(buf: Buffer): ImageDimensions | undefined {
  if (buf.length < 30) return undefined;
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") {
    return undefined;
  }

  const chunk = buf.toString("ascii", 12, 16);

  if (chunk === "VP8 ") {
    // Lossless-free bitstream: 3-byte frame tag, then a 3-byte sync code.
    if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return undefined;
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }

  if (chunk === "VP8L") {
    if (buf[20] !== 0x2f) return undefined;
    // 14 bits each, minus one, packed little-endian after the signature byte.
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  if (chunk === "VP8X") {
    // Canvas size as two 24-bit little-endian values, each stored minus one.
    const w = buf[24] | (buf[25] << 8) | (buf[26] << 16);
    const h = buf[27] | (buf[28] << 8) | (buf[29] << 16);
    return { width: w + 1, height: h + 1 };
  }

  return undefined;
}

export function imageSize(file: string): ImageDimensions | undefined {
  const buf = readHead(file);
  if (!buf) return undefined;

  const size = png(buf) ?? jpeg(buf) ?? webp(buf);
  if (!size || !size.width || !size.height) return undefined;
  return size;
}
