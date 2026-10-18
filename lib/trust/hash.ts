import { PHOTO_HASH_HAMMING_MAX } from "@/lib/trust/types";

export function dHashHamming(left: string, right: string): number | null {
  if (!left || left.length !== right.length) return null;
  let bits = 0;
  for (let index = 0; index < left.length; index += 1) {
    const a = Number.parseInt(left[index], 16);
    const b = Number.parseInt(right[index], 16);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    let mixed = a ^ b;
    while (mixed) {
      bits += mixed & 1;
      mixed >>= 1;
    }
  }
  return bits;
}

export function photoHashesCollide(left: string[], right: string[]): boolean {
  for (const source of left) {
    for (const other of right) {
      const distance = dHashHamming(source, other);
      if (distance !== null && distance <= PHOTO_HASH_HAMMING_MAX) return true;
    }
  }
  return false;
}
