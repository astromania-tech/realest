/**
 * Compensating transaction pattern for Auth admin createUser + Prisma writes.
 * Auth and Postgres are separate systems; Prisma $transaction cannot roll back Auth.
 */

export type AuthDbCompensateResult =
  | { ok: true; userId: string }
  | { ok: false; error: "db_persist_failed" | "auth_create_failed" };

/**
 * Create Auth user, then persist DB rows. If DB fails, delete Auth user.
 */
export async function createWithAuthDbCompensate(params: {
  createAuthUser: () => Promise<{ userId: string }>;
  persistDb: (userId: string) => Promise<void>;
  deleteAuthUser: (userId: string) => Promise<void>;
}): Promise<AuthDbCompensateResult> {
  let userId: string | null = null;
  try {
    const created = await params.createAuthUser();
    userId = created.userId;
  } catch {
    return { ok: false, error: "auth_create_failed" };
  }

  try {
    await params.persistDb(userId);
    return { ok: true, userId };
  } catch {
    try {
      await params.deleteAuthUser(userId);
    } catch {
      // Caller should log; Auth orphan may remain if delete also fails.
    }
    return { ok: false, error: "db_persist_failed" };
  }
}
