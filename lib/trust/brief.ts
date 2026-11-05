import { claimsBlockBadge, type ClaimFinding } from "@/lib/trust/claims";

export function writeJudgment(input: {
  title: string;
  address: string;
  description: string;
  findings: ClaimFinding[];
}): string {
  const listing = input.description.trim().replace(/\s+/g, " ").slice(0, 180);
  const points = input.findings.map((finding) => `${finding.point} is ${finding.status}. ${finding.evidence}`);
  const blocked = claimsBlockBadge(input.findings);
  const decision = blocked
    ? `Judgment: do not approve "${input.title}" at ${input.address}. ${blocked}`
    : `Judgment: "${input.title}" at ${input.address} can go to human review. A person still writes the badge. The visit does not prove title by itself.`;
  return [`The listing says: ${listing || "no description was submitted."}`, ...points, decision].join(" ");
}
