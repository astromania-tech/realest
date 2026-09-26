#!/usr/bin/env node
import "dotenv/config";
import { loadSupabaseAccessToken, inspectJwt } from "./jwt-auth.ts";

async function main(): Promise<void> {
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const base = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).replace(/\/$/, "");

  if (!svc || !base) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }

  const roles = [
    { label: "ADMIN", email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
    { label: "AGENT", email: process.env.AGENT_EMAIL, password: process.env.AGENT_PASSWORD },
    { label: "OWNER", email: process.env.OWNER_EMAIL, password: process.env.OWNER_PASSWORD },
    { label: "USER", email: process.env.USER_EMAIL, password: process.env.USER_PASSWORD },
  ];

  for (const r of roles) {
    try {
      console.log("\n---", r.label, "login...");
      const token = await loadSupabaseAccessToken({
        label: r.label,
        baseUrlEnvNames: ["NEXT_PUBLIC_SUPABASE_URL"],
        anonKeyEnvNames: ["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
        emailEnvNames: [
          r.label === "ADMIN"
            ? "ADMIN_EMAIL"
            : r.label === "AGENT"
              ? "AGENT_EMAIL"
              : r.label === "OWNER"
                ? "OWNER_EMAIL"
                : "USER_EMAIL",
        ],
        passwordEnvNames: [
          r.label === "ADMIN"
            ? "ADMIN_PASSWORD"
            : r.label === "AGENT"
              ? "AGENT_PASSWORD"
              : r.label === "OWNER"
                ? "OWNER_PASSWORD"
                : "USER_PASSWORD",
        ],
      });

      console.log(r.label, "access_token received (truncated):", token.slice(0, 32) + "...");
      const validation = inspectJwt(token);
      console.log(r.label, "token inspection:", validation);

      let payload: { session_id?: string } | null = null;
      try {
        const parts = token.split(".");
        payload = JSON.parse(
          Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString(
            "utf8",
          ),
        ) as { session_id?: string };
      } catch (e: unknown) {
        console.warn(
          "Failed decode jwt payload for",
          r.label,
          e instanceof Error ? e.message : String(e),
        );
      }

      const sessionId = payload?.session_id;
      console.log(r.label, "session_id:", sessionId);

      const headers = {
        apikey: svc,
        Authorization: `Bearer ${svc}`,
        "Content-Type": "application/json",
      };

      if (sessionId) {
        try {
          const sessRes = await fetch(`${base}/rest/v1/auth.sessions?id=eq.${sessionId}`, {
            headers,
          });
          const sessText = await sessRes.text();
          console.log(r.label, "auth.sessions:", sessText);
        } catch (e: unknown) {
          console.log(
            r.label,
            "auth.sessions query failed:",
            e instanceof Error ? e.message : String(e),
          );
        }
      } else {
        console.log(r.label, "No session_id in token");
      }

      try {
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
        const userRes = await fetch(`${base}/auth/v1/user`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
        });
        const userText = await userRes.text();
        console.log(r.label, "/auth/v1/user =>", userRes.status, userRes.statusText, userText);
      } catch (e: unknown) {
        console.log(
          r.label,
          "/auth/v1/user check failed:",
          e instanceof Error ? e.message : String(e),
        );
      }

      try {
        const email = r.email ?? "";
        const param = `${encodeURIComponent("payload->>actor_username")}=eq.${encodeURIComponent(email)}`;
        const auditRes = await fetch(
          `${base}/rest/v1/auth.audit_log_entries?select=payload,created_at&${param}&order=created_at.desc&limit=10`,
          { headers },
        );
        const auditText = await auditRes.text();
        console.log(r.label, "auth.audit_log_entries (recent):", auditText);
      } catch (e: unknown) {
        console.log(
          r.label,
          "audit query failed:",
          e instanceof Error ? e.message : String(e),
        );
      }
    } catch (e: unknown) {
      console.error(r.label, "error:", e instanceof Error ? e.message : String(e));
    }
  }
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
