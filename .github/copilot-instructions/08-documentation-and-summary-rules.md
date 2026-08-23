---
name: documentation-and-summary-rules
version: 2.0.0
category: Output & Artifact Management
applies_to: "**/*.md, **/docs/**, **/*.ts, **/*.tsx"
trigger: task-start, task-completion, documentation, summary-creation, doc-audit
---

# 📋 DOCUMENTATION INTEGRITY & LIFECYCLE RULES

**Status:** ✅ MANDATORY & ENFORCED  
**Violation Impact:** Commit rejection, misleading project state, cascading bugs  
**Last Updated:** May 2026

> **CORE PRINCIPLE:** Docs must reflect *actual* state, not *intended* state.
> A document that says "Complete" when work is incomplete is worse than no document at all —
> it creates false confidence, blocks issue discovery, and misleads future development.

---

## 🚦 PHASE 0: PRE-FLIGHT DOC AUDIT (REQUIRED BEFORE ANY DOC WORK)

**Before creating, editing, or referencing any documentation file, you MUST run a pre-flight audit:**

### Step 1 — Search for existing docs on this topic

```
SEARCH CHECKLIST:
☐ docs/ — root and all subdirectories
☐ docs/done/ — archived "complete" files
☐ .github/copilot-instructions/ — architecture rules
☐ README.md — top-level references
```

### Step 2 — Read the existing file before touching it

- What status does it claim? (`✅ COMPLETE`, `🚧 IN PROGRESS`, `⚠️ BLOCKED`)
- Does that status match the actual codebase? **Verify by checking the referenced files.**
- Are there unchecked `[ ]` items? If yes, the task is **not complete** regardless of what the header says.
- Are there placeholder implementations (e.g., `Math.random()`, `TODO:`, `// placeholder`)? If yes, the feature is **not production-ready**.

### Step 3 — Correct false positives BEFORE adding new content

If you find a doc that claims completion but is demonstrably incomplete:
1. Change the status header **first**
2. Add a `## ⚠️ Status Correction` section documenting what is actually pending
3. Only then add your new content

---

## 📊 HONEST STATUS SYSTEM

Every document MUST include a status block at the top. Use **only** these statuses:

```markdown
**Status:** 🔴 NOT STARTED
**Status:** 🟡 IN PROGRESS — [X of Y tasks complete]
**Status:** 🟠 BLOCKED — [reason]
**Status:** 🔵 NEEDS TESTING — [implementation done, testing pending]
**Status:** ✅ VERIFIED COMPLETE — [tested on: DATE]
**Status:** ⚠️ PARTIAL — [what's done vs what's pending]
**Status:** 🗄️ DEPRECATED — [superseded by: FILENAME]
```

### ❌ BANNED STATUS PHRASES

These are misleading and **must never appear** in a status line:

| Banned | Why | Use Instead |
|--------|-----|-------------|
| `✅ IMPLEMENTATION COMPLETE` | Conflates code written with code working | `🔵 NEEDS TESTING` |
| `✅ COMPLETE` (with unchecked `[ ]` items) | Direct contradiction | `🟡 IN PROGRESS` |
| `✅ Production ready with placeholder ML` | Oxymoron | `🔵 NEEDS TESTING — placeholder ML only` |
| `Ready for Integration Testing 🚀` | Optimism masking gaps | `🔵 NEEDS TESTING` |
| `Phase X Status: ✅ COMPLETE` when target metrics unmet | False positive | `⚠️ PARTIAL` |
| `DEPLOYMENT READY` without deployment verification | Unverified claim | `🔵 NEEDS TESTING` |

---

## 🧱 DOC CREATION RULES

### Rule 1: ONE topic = ONE file

Do not create new files that cover the same subject as an existing file.

```
❌ WRONG:
docs/ml-validation-flow.md
docs/ml-validation-implementation-checklist.md   ← DUPLICATE TOPIC
docs/ml-validation-quick-reference.md            ← DUPLICATE TOPIC

✅ RIGHT:
docs/ml-validation.md
  ## Overview
  ## API Endpoints
  ## Quick Reference
  ## Testing Checklist
  ## Deployment Checklist
```

### Rule 2: No per-session or per-task summary files

Summary files create a graveyard of stale snapshots. They become the #1 source of false positives.

```
❌ NEVER CREATE:
docs/session-completion-summary.md
docs/phase-1-completion-summary.md
docs/property-form-refactoring-complete.md
docs/IMPLEMENTATION_COMPLETE.md
docs/done/AGENT_SIGNUP_COMMIT_SUCCESS.md

✅ INSTEAD: Update the living feature doc with a timestamped changelog entry
```

**Exception:** `ROADMAP.md` is the only "summary" file allowed — it tracks cross-feature progress over time.

### Rule 3: No `done/` folder for completed tasks

The `docs/done/` folder defeats the purpose of documentation — it hides information and implies tasks are fully resolved when they may not be. **Archive only with `🗄️ DEPRECATED` status in the file itself, not by moving it.**

### Rule 4: Naming convention

```
✅ Allowed:
  01-getting-started.md         (numbered for ordered reading)
  ml-validation.md              (descriptive, topic-based)
  api-documentation.md          (descriptive)
  ROADMAP.md                    (uppercase for special project files)
  README.md

❌ Not allowed:
  *-complete.md
  *-summary.md
  *-implementation-complete.md
  *-setup-guide.md              (if setup already covered)
  DEPLOYMENT-READY.md
  session-*.md
  phase-*-completion-*.md
```

---

## ✅ CHECKLIST INTEGRITY RULES

Checklists (`- [ ]` / `- [x]`) are the ground truth of completion. These rules govern them:

### When writing a checklist:

1. **Only check `[x]` items you have personally verified** — not items you believe are done
2. If an item says "Test X" and you haven't run the test, it stays `[ ]`
3. If an item involves a real service (ML, payment, email) and only a placeholder exists, it stays `[ ]`
4. **Never check an entire section `[x]` based on the section above it being done**

### Placeholder vs. Production distinction:

```markdown
## Checklist

### Implementation
- [x] Route created: /api/admin/validation/document
- [x] Auth check implemented
- [x] Zod schema validation

### ML Integration  ← This is a SEPARATE phase
- [ ] OCR service connected (currently: Math.random() placeholder)
- [ ] Deepfake detection connected (currently: placeholder)
- [ ] Confidence thresholds validated against real data

### Testing
- [ ] Manual test: document validation with sample PDF
- [ ] Manual test: invalid file type rejection
- [ ] Unit tests for auth layer
```

---

## 🗑️ DOC OBSOLETION & CLEANUP PROTOCOL

### When a doc becomes obsolete:

A doc is obsolete when:
- It describes a system that has been replaced
- It references files that no longer exist
- Its content is fully absorbed into another doc
- It was a session summary that never should have existed

### How to handle it:

**Step 1:** Add this block to the TOP of the file:

```markdown
> [!CAUTION]
> **🗄️ DEPRECATED** — This file is obsolete.  
> **Superseded by:** [docs/feature-name.md](./feature-name.md)  
> **Reason:** [brief reason]  
> **Date deprecated:** YYYY-MM-DD  
> **Action:** Safe to delete after confirming content is merged.
```

**Step 2:** Ensure the superseding file contains the relevant non-redundant content.

**Step 3:** Delete the file in a dedicated `refactor: remove obsolete docs` commit.

### Docs in this repo currently flagged for review:

The following files should be audited and likely consolidated or deprecated:

| File | Issue | Recommended Action |
|------|-------|--------------------|
| `docs/session-completion-summary.md` | Per-session dump, false ✅ COMPLETE | Merge useful content → feature docs, then delete |
| `docs/phase-1-completion-summary.md` | Phase summary, per-task doc | Merge into ROADMAP.md, then delete |
| `docs/phase-2-completion-summary.md` | Claims phase goals met; metrics show they aren't | Update ROADMAP.md with honest status, delete |
| `docs/ml-validation-implementation-checklist.md` | Overlaps with `ml-validation-flow.md`; has unchecked items | Consolidate into `ml-validation.md`, delete |
| `docs/ml-validation-quick-reference.md` | Subset of `ml-validation-flow.md` | Merge as `## Quick Reference` section, delete |
| `docs/done/IMPLEMENTATION_COMPLETE.md` | In `done/` folder; testing items unchecked | Move honest status back to `property-vs-listing-implementation-plan.md` |
| `docs/done/ADMIN_INVITATION_SYSTEM_COMPLETE.md` | Claims complete; verify against codebase | Audit, then either verify or flag partial |
| `docs/api/api-documentation-complete.md` | Duplicate of other API docs | Consolidate into `docs/api-documentation.md` |
| `docs/api/api-auto-update-implementation-complete.md` | Session artifact | Review and delete |
| `docs/branch-quick-reference.md` | Likely subset of `branch-management.md` | Merge or verify it adds unique value |
| `docs/referral-waitlist-rewards-e2e-checklist.md` | Likely overlaps with spec | Merge into spec doc |

---

## 📁 TARGET DOCS STRUCTURE

```
docs/
  README.md                         ← Project overview + links to all docs
  ROADMAP.md                        ← Cross-feature progress tracker (living doc)
  
  01-getting-started.md             ← Dev onboarding, env setup
  02-architecture.md                ← System design, DB schema, route structure
  03-design-system.md               ← UI tokens, component strategy (70-25-5)
  04-api-documentation.md           ← All API endpoints, templates, examples
  05-ml-validation.md               ← ML pipeline: endpoints, checklist, integration
  06-forms.md                       ← Form patterns
  07-authentication.md              ← Auth flows
  08-branch-management.md           ← Branch strategy, commit rules
  
  design/
    realest-ng-design-architecture.md
    theme-system.md
    branding.md
  
  references/
    nigerian-market.md
    type-reference.md
```

---

## 🔄 LIVING DOCUMENT PROTOCOL

Key docs are **living documents** — they evolve with the project. Follow this protocol:

### When completing a task that affects an existing doc:

```
1. Open the existing doc
2. Run pre-flight audit (Step 2 above)
3. Update status block at top
4. Add/update the relevant section
5. Add a changelog entry at the bottom:

---
## Changelog
- **2026-05-26**: Added document validation endpoints (routes created, placeholder ML)
- **2026-05-24**: Initial structure and overview
```

### ROADMAP.md is the progress tracker

Use `ROADMAP.md` for cross-phase progress. It should reflect **actual** progress, not planned progress. Use this format per phase item:

```markdown
- [x] **0.1 Supabase Initialization** — Schema live, RLS configured ✅
- [/] **2.2 ML Document Validation** — Routes created, placeholder ML only 🟡
- [ ] **4.1 Automated ML Integration** — Not started 🔴
```

---

## 🚫 ENFORCEMENT CHECKLIST (Before Committing)

```
☐ Did I run the pre-flight doc audit?
☐ Did I correct any false-positive status I found?
☐ Does every doc I touched have an honest status block?
☐ Are ALL unchecked [ ] items genuinely unchecked?
☐ Did I avoid creating per-task/per-session summary files?
☐ Did I update an existing file instead of creating a new one?
☐ Does the doc name follow the naming convention? (no *-complete, *-summary)
☐ If I deprecated something, did I mark it at the top of the file?
☐ Did I update ROADMAP.md if a milestone changed?
```

**Reject commit if:**
- New file duplicates an existing topic
- A doc says "COMPLETE" but has unchecked `[ ]` testing items
- A doc says "production ready" with placeholder implementations
- Filename contains: `complete`, `summary`, `session`, `deployment-ready`
- `docs/done/` folder gains new files

---

## ❓ QUICK REFERENCE

| Situation | Action |
|-----------|--------|
| Task finished but untested | Status: `🔵 NEEDS TESTING` |
| Code written, real service not yet wired | Status: `⚠️ PARTIAL — placeholder only` |
| All tests pass, verified in dev | Status: `✅ VERIFIED COMPLETE — tested: DATE` |
| Want to document task completion | Update the **feature doc**, not a new summary |
| Found a doc claiming ✅ COMPLETE that isn't | Fix the status **before** reading further — it's a false positive |
| Two docs on the same topic | Merge the smaller into the larger, deprecate the smaller |
| Doc references files that no longer exist | Mark `🗄️ DEPRECATED`, migrate live content, then delete |
| Phase goal not met but doc says it is | Update ROADMAP.md with honest `⚠️ PARTIAL` and real metrics |
