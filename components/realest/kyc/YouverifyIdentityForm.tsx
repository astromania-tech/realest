"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { VerifiedPersonBadge } from "@/components/realest/badges/VerifiedPersonBadge";
import { personKycMessage, type PersonBadge } from "@/lib/kyc/person-badge";

export function YouverifyIdentityForm({
  role,
  initialBadge = "none",
  initialReason = null,
}: {
  role: "owner" | "agent";
  initialBadge?: PersonBadge;
  initialReason?: string | null;
}) {
  const [idType, setIdType] = useState(role === "agent" ? "cac" : "nin");
  const [idNumber, setIdNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [idImageBase64, setIdImageBase64] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, setPending] = useState(false);
  const [badge, setBadge] = useState<PersonBadge>(initialBadge);
  const [reason, setReason] = useState<string | null>(initialReason);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!consent) {
      setError("Consent is required before Youverify can check this identity.");
      return;
    }
    setPending(true);
    setError("");
    const response = await fetch("/api/kyc/youverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idType,
        idNumber,
        consent: true,
        firstName,
        lastName,
        dateOfBirth,
        companyName,
        idImageBase64,
      }),
    });
    const body = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(body.error || "Youverify did not accept this identity.");
      return;
    }
    setIdNumber("");
    setBadge(body.personBadge ?? "none");
    setReason(typeof body.reason === "string" ? body.reason : null);
  }

  const outcome = personKycMessage(badge, reason);

  return (
    <form className="space-y-4" onSubmit={submit}>
      {badge === "verified" ? <VerifiedPersonBadge /> : null}
      {outcome ? <p className="text-sm">{outcome}</p> : null}
      {role === "owner" ? (
        <label className="block text-sm">
          Identity type
          <select
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            value={idType}
            onChange={(event) => setIdType(event.target.value)}
          >
            <option value="nin">NIN</option>
            <option value="bvn">BVN</option>
          </select>
        </label>
      ) : (
        <p className="text-sm text-muted-foreground">CAC registration number, including the prefix. Example: RC1234567.</p>
      )}
      {role === "owner" ? (
        <>
          <label className="block text-sm">
            First name on the record
            <input
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              value={firstName}
              autoComplete="given-name"
              onChange={(event) => setFirstName(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Last name on the record
            <input
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              value={lastName}
              autoComplete="family-name"
              onChange={(event) => setLastName(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Date of birth on the record
            <input
              className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              type="date"
              value={dateOfBirth}
              autoComplete="bday"
              onChange={(event) => setDateOfBirth(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Photo of the face on this ID
            <input
              className="mt-1 block w-full text-sm"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  setIdImageBase64("");
                  return;
                }
                if (file.size > 1_000_000) {
                  setIdImageBase64("");
                  setError("Upload a JPEG, PNG, or WebP photo of the face on this ID. Maximum size is 1 MB.");
                  event.target.value = "";
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  setError("");
                  setIdImageBase64(typeof reader.result === "string" ? reader.result : "");
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </>
      ) : (
        <label className="block text-sm">
          Company name on the CAC record
          <input
            className="mt-1 w-full rounded-md border bg-background px-3 py-2"
            value={companyName}
            autoComplete="organization"
            onChange={(event) => setCompanyName(event.target.value)}
            required
          />
        </label>
      )}
      <label className="block text-sm">
        {role === "agent" ? "CAC number" : "Identity number"}
        <input
          className="mt-1 w-full rounded-md border bg-background px-3 py-2"
          value={idNumber}
          autoComplete="off"
          onChange={(event) => setIdNumber(event.target.value)}
          required
        />
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        I consent to Youverify checking this identity.
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Checking" : "Check with Youverify"}
      </Button>
    </form>
  );
}
