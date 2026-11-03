/** Browser-only image preparation. These files are never posted to a server. */
export const referenceLimits = {
  count: 3,
  bytes: 5 * 1024 * 1024,
  pixels: 20_000_000,
  edge: 8192,
};

export async function inspectReferenceImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error(
      "Choose JPEG, PNG or WebP photographs. Other file types are not supported.",
    );
  if (!file.size || file.size > referenceLimits.bytes)
    throw new Error(
      "Each image must be larger than zero bytes and no more than 5 MB.",
    );
  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const signature =
    file.type === "image/jpeg"
      ? header[0] === 255 && header[1] === 216 && header[2] === 255
      : file.type === "image/png"
        ? [137, 80, 78, 71, 13, 10, 26, 10].every(
            (byte, index) => header[index] === byte,
          )
        : String.fromCharCode(...header.slice(0, 4)) === "RIFF" &&
          String.fromCharCode(...header.slice(8, 12)) === "WEBP";
  if (!signature)
    throw new Error(
      "The file contents do not match its image type. Choose a genuine JPEG, PNG or WebP image.",
    );
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "This photograph could not be opened. Try a different image.",
    );
  }
  const width = bitmap.width,
    height = bitmap.height;
  bitmap.close();
  if (
    width > referenceLimits.edge ||
    height > referenceLimits.edge ||
    width * height > referenceLimits.pixels
  )
    throw new Error(
      "Choose an image no larger than 8,192 pixels on either edge and 20 megapixels in total.",
    );
  return { width, height };
}
