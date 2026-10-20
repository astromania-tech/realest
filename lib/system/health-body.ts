export function publicHealthBody(databaseUp: boolean): { status: "ok" | "unavailable" } {
  return { status: databaseUp ? "ok" : "unavailable" };
}
