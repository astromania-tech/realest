import type { KycRow, KycStore } from "@/lib/kyc/types";

export function memoryKycStore(seed: KycRow[] = []): KycStore & { rows: KycRow[] } {
  const rows = [...seed];
  return {
    rows,
    async listForUser(userId) {
      return rows.filter((row) => row.userId === userId);
    },
    async insert(row) {
      const saved = { ...row, id: `kyc_${rows.length + 1}` };
      rows.push(saved);
      return saved;
    },
    async findByReference(referenceId) {
      return rows.find((row) => row.referenceId === referenceId) ?? null;
    },
    async findByRequestId(requestId) {
      return rows.find((row) => row.requestId === requestId) ?? null;
    },
    async update(id, patch) {
      const row = rows.find((item) => item.id === id);
      if (!row) throw new Error("missing row");
      Object.assign(row, patch);
      return row;
    },
  };
}
