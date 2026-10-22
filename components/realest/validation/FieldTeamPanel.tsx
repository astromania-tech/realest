"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Candidate = {
  id: string;
  full_name: string | null;
  role: string;
  state: string | null;
  lga: string | null;
  openVisits: number;
  geoMatch: "state_lga" | "state" | "none" | "unknown";
  recommended: boolean;
  overload: boolean;
};

type TeamPayload = {
  team: {
    propertyId: string;
    teamLeaderId: string;
    teamLeaderName: string | null;
    checkInOfficerId: string;
    checkInOfficerName: string | null;
    visitDay: string;
    brief: string | null;
    confirmedAt: string | null;
    memberIds: string[];
    members: Array<{ id: string; full_name: string | null; role: string }>;
  } | null;
  property: { id: string; title: string; city: string; state: string | null } | null;
  leaders: Candidate[];
  members: Candidate[];
  recommendedLeaderIds: string[];
  recommendedMemberIds: string[];
  capabilities: {
    assignLeader: boolean;
    confirmTeam: boolean;
    isAssignedLeader: boolean;
    canForceGeoOverride: boolean;
  };
};

function candidateLabel(person: Candidate): string {
  const place = [person.lga, person.state].filter(Boolean).join(", ") || "no location set";
  const load = `${person.openVisits} open`;
  const tag = person.recommended
    ? "recommended"
    : person.geoMatch === "none"
      ? "wrong state"
      : person.overload
        ? "busy"
        : person.geoMatch;
  return `${person.full_name || person.role} · ${place} · ${load} · ${tag}`;
}

export function FieldTeamPanel({
  propertyId,
  onCompleted,
}: {
  propertyId: string;
  onCompleted?: () => void;
}) {
  const router = useRouter();
  const [data, setData] = useState<TeamPayload | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [leaderId, setLeaderId] = useState("");
  const [visitDay, setVisitDay] = useState("");
  const [brief, setBrief] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [checkInOfficerId, setCheckInOfficerId] = useState("");
  const [forceGeoOverride, setForceGeoOverride] = useState(false);

  async function load() {
    const response = await fetch(`/api/admin/validation/field-teams/${propertyId}`);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.error || "Could not load the field team.");
      return;
    }
    const payload = body as TeamPayload;
    setData(payload);
    if (payload.team) {
      setLeaderId(payload.team.teamLeaderId);
      setVisitDay(payload.team.visitDay);
      setBrief(payload.team.brief ?? "");
      setMemberIds(payload.team.memberIds.filter((id) => id !== payload.team?.teamLeaderId));
      setCheckInOfficerId(payload.team.checkInOfficerId);
    } else if (payload.recommendedLeaderIds[0]) {
      setLeaderId(payload.recommendedLeaderIds[0]);
    }
  }

  useEffect(() => {
    void load();
  }, [propertyId]);

  async function assignLeader() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/admin/validation/field-teams/${propertyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "assign_leader",
        team_leader_id: leaderId,
        visit_day: visitDay,
        brief: brief || null,
        force_geo_override: forceGeoOverride,
      }),
    });
    const body = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(body.error || "Could not assign the team leader.");
      return;
    }
    await load();
    router.refresh();
  }

  async function confirmTeam() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/admin/validation/field-teams/${propertyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "confirm_team",
        member_ids: memberIds,
        check_in_officer_id: checkInOfficerId,
        force_geo_override: forceGeoOverride,
      }),
    });
    const body = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(body.error || "Could not confirm the team.");
      return;
    }
    await load();
    router.refresh();
    onCompleted?.();
  }

  function toggleMember(id: string) {
    setMemberIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading field team…</p>;
  }

  const canConfirm =
    data.capabilities.confirmTeam &&
    (data.capabilities.assignLeader || data.capabilities.isAssignedLeader) &&
    Boolean(data.team);

  const memberRoster = data.members.filter((person) => person.id !== data.team?.teamLeaderId);
  const selectedPeople = data.members.filter(
    (person) =>
      person.id === data.team?.teamLeaderId ||
      memberIds.includes(person.id) ||
      person.id === checkInOfficerId,
  );
  const controlClass =
    "w-full min-w-0 rounded-md border bg-background px-3 py-2.5 text-base sm:py-2 sm:text-sm";

  return (
    <div className="min-w-0 space-y-5">
      <div>
        <h3 className="text-base font-semibold">Field team</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Officers are ranked by location match and unfinished visits. Same-state officers with fewer
          open tasks are recommended first.
        </p>
        {data.property ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Property location: {[data.property.city, data.property.state].filter(Boolean).join(", ") || "unknown"}
          </p>
        ) : null}
      </div>

      {data.recommendedLeaderIds.length > 0 ? (
        <div className="rounded-xl border border-brand-accent/30 bg-brand-accent/10 p-3 text-sm">
          <p className="font-semibold text-[#07402F]">Recommended free leaders</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            {data.leaders
              .filter((person) => data.recommendedLeaderIds.includes(person.id))
              .map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    className="text-left text-primary underline-offset-2 hover:underline"
                    onClick={() => setLeaderId(person.id)}
                  >
                    {candidateLabel(person)}
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      {data.team ? (
        <div className="break-words rounded-xl border border-border bg-secondary/40 p-3 text-sm sm:p-4">
          <p>
            Leader: <span className="font-semibold">{data.team.teamLeaderName || "Staff"}</span>
          </p>
          <p className="mt-1">Visit day: {data.team.visitDay}</p>
          <p className="mt-1">
            Check-in officer:{" "}
            <span className="font-semibold">
              {data.team.confirmedAt
                ? data.team.checkInOfficerName || "Staff"
                : "Not confirmed yet"}
            </span>
          </p>
          <p className="mt-1">
            Status:{" "}
            {data.team.confirmedAt
              ? `Confirmed ${new Date(data.team.confirmedAt).toLocaleString("en-NG")}`
              : "Waiting for team confirmation"}
          </p>
          {data.team.brief ? <p className="mt-2 text-muted-foreground">{data.team.brief}</p> : null}
        </div>
      ) : null}

      {data.capabilities.assignLeader ? (
        <div className="space-y-2 rounded-xl border border-border p-3 sm:p-4">
          <p className="text-sm font-semibold">1. Assign team leader</p>
          <label className="block text-sm" htmlFor="field-leader">
            Team leader
          </label>
          <select
            id="field-leader"
            className={controlClass}
            value={leaderId}
            onChange={(event) => setLeaderId(event.target.value)}
          >
            <option value="">Choose a leader</option>
            {data.leaders.map((person) => (
              <option key={person.id} value={person.id} disabled={person.geoMatch === "none" && !forceGeoOverride}>
                {candidateLabel(person)}
              </option>
            ))}
          </select>
          <label className="block text-sm" htmlFor="field-day">
            Visit day
          </label>
          <input
            id="field-day"
            type="date"
            className={controlClass}
            value={visitDay}
            onChange={(event) => setVisitDay(event.target.value)}
          />
          <label className="block text-sm" htmlFor="field-brief">
            Brief (optional)
          </label>
          <textarea
            id="field-brief"
            className={`min-h-20 ${controlClass}`}
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder="What the team should verify on site"
          />
          {data.capabilities.canForceGeoOverride ? (
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={forceGeoOverride}
                onChange={(event) => setForceGeoOverride(event.target.checked)}
              />
              Admin override: allow different state (Lagos officer on Abuja property)
            </label>
          ) : null}
          <Button className="w-full" variant="outline" disabled={pending} onClick={() => void assignLeader()}>
            Assign leader
          </Button>
        </div>
      ) : null}

      {canConfirm ? (
        <div className="space-y-2 rounded-xl border border-border p-3 sm:p-4">
          <p className="text-sm font-semibold">2. Confirm team</p>
          <p className="text-xs text-muted-foreground">
            Same-state officers with fewer open visits appear first. Designate who checks in at the pin.
          </p>
          {data.recommendedMemberIds.length > 0 ? (
            <p className="text-xs text-[#07402F]">
              Suggested:{" "}
              {data.members
                .filter((person) => data.recommendedMemberIds.includes(person.id))
                .map((person) => person.full_name || person.role)
                .join(", ")}
            </p>
          ) : null}
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-md border p-2">
            {memberRoster.map((person) => (
              <label key={person.id} className="flex min-w-0 items-start gap-2 text-sm">
                <input
                  className="mt-1 shrink-0"
                  type="checkbox"
                  checked={memberIds.includes(person.id)}
                  disabled={person.geoMatch === "none" && !forceGeoOverride}
                  onChange={() => toggleMember(person.id)}
                />
                <span className="min-w-0 break-words">
                  {candidateLabel(person)}
                  {person.recommended ? (
                    <span className="ml-1 rounded-full bg-brand-accent/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#07402F]">
                      Free
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
            {memberRoster.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No other field staff yet. Invite them with state and LGA from Staff invites.
              </p>
            ) : null}
          </div>
          <label className="block text-sm" htmlFor="field-check-in">
            Check-in officer
          </label>
          <select
            id="field-check-in"
            className={controlClass}
            value={checkInOfficerId}
            onChange={(event) => setCheckInOfficerId(event.target.value)}
          >
            <option value="">Choose officer</option>
            {(selectedPeople.length > 0
              ? selectedPeople
              : data.team
                ? [
                    {
                      id: data.team.teamLeaderId,
                      full_name: data.team.teamLeaderName,
                      role: "team_leader",
                      state: null,
                      lga: null,
                      openVisits: 0,
                      geoMatch: "unknown" as const,
                      recommended: false,
                      overload: false,
                    },
                  ]
                : []
            ).map((person) => (
              <option key={person.id} value={person.id}>
                {person.full_name || person.role}
              </option>
            ))}
          </select>
          <Button className="w-full" disabled={pending} onClick={() => void confirmTeam()}>
            Confirm team and notify
          </Button>
        </div>
      ) : null}

      {data.team?.confirmedAt ? (
        <Link
          href={`/field/visit/${propertyId}`}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-semibold text-primary sm:w-auto sm:justify-start sm:border-0 sm:p-0 sm:underline"
        >
          Open phone check-in
        </Link>
      ) : null}

      {error ? <p className="break-words text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
