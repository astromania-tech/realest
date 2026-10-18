const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function lagosToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function visitAssignmentAllowed(input: {
  currentOfficerId: string | null;
  officerId: string;
  visitDay: string;
  today: string;
}): { ok: true } | { ok: false; status: 400 | 409; error: string } {
  if (!UUID.test(input.officerId)) {
    return { ok: false, status: 400, error: "Choose an officer." };
  }
  if (!DAY.test(input.visitDay) || input.visitDay < input.today) {
    return { ok: false, status: 400, error: "Choose a visit day that is today or later." };
  }
  if (input.currentOfficerId && input.currentOfficerId !== input.officerId) {
    return { ok: false, status: 409, error: "This visit is already assigned." };
  }
  return { ok: true };
}

export function badgeWriteAllowed(input: {
  officerId: string | null;
  visitDay: string | null;
}): { ok: true } | { ok: false; error: string } {
  if (!input.officerId || !input.visitDay) {
    return { ok: false, error: "Assign one officer and a visit day before approving the visit." };
  }
  return { ok: true };
}
