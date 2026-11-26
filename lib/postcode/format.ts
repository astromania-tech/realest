const COMPACT = /^([A-Z]{2})(\d{2})([A-Z0-9]{3})([A-Z]{2})(\d{2})$/;

/** Canonical NIPOST code, for example LA-11-W06-TC-10. A shape match is not proof the code exists. */
export function parseNipostPostcode(input: string): { canonical: string } | null {
  const compact = input.trim().toUpperCase().replace(/[\s-]+/g, "");
  const match = COMPACT.exec(compact);
  if (!match) return null;
  const [, state, lga, district, area, unit] = match;
  return { canonical: `${state}-${lga}-${district}-${area}-${unit}` };
}
