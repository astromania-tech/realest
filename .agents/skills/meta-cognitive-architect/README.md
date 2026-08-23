# Meta-Cognitive Architect - User Guide

**VERSION:** 2.0.0 (Refactored, Modular)  
**For:** RealEST Project Developers  
**Created:** May 24, 2026  

---

## 📚 OVERVIEW

The **Meta-Cognitive Architect** is a reasoning framework that uses **System 2 thinking** (slow, deliberate) for complex coding decisions. It operates using a **5-Phase Recursive Reasoning Loop** to eliminate hallucinations, identify logical fallacies, and deliver solutions with explicit confidence scoring.

**Three Modes:**
1. **Direct Fix:** Routine tasks (typos, simple edits) → Instant response
2. **Analysis:** Complex tasks → 5-phase reasoning → Confidence score
3. **Execution:** Approved analysis (GCS ≥ 0.85) → Implementation + tests

---

## 🎯 WHEN TO USE

### Use Meta-Cognitive Architect For:

```yaml
COMPLEX ARCHITECTURAL DECISIONS:
  - New feature design (3+ systems affected)
  - Database schema changes
  - API endpoint architecture
  - Authentication/authorization changes

CROSS-DOMAIN INTEGRATION:
  - Design + Components + Types working together
  - Form patterns + Validation + Type system
  - Auth + Routes + Role checking

TYPE SYSTEM & DATA FLOW:
  - Complex TypeScript scenarios
  - Zod schema architecture
  - API response mapping
  - Database query design

NIGERIAN MARKET FEATURES:
  - Infrastructure mapping (NEPA, water, security)
  - Localization (state/LGA cascading)
  - Phone validation patterns
  - Currency/pricing logic

DESIGN SYSTEM DECISIONS:
  - Component selection (HeroUI vs custom)
  - Color token usage
  - Typography hierarchy
  - Responsive layout strategy
```

### Skip Meta-Cognitive Architect For:

```yaml
TRIVIAL FIXES:
  - Typo corrections ("Componnet" → "Component")
  - Single-line bug patches
  - CSS formatting (spacing, indentation)
  - Import reorganization

ISOLATED TASKS:
  - Documentation updates
  - Test writing (after design approved)
  - Dependency version bumps
  - Build configuration changes

ROUTINE MAINTENANCE:
  - Naming consistency
  - File organization
  - Code comments
  - Example updates
```

---

## 🚀 HOW TO USE (3 Scenarios)

### Scenario 1: Complex Task (Full Analysis)

**You have:** "I need to add authentication to the owner dashboard"

**Step 1: Request Analysis**
```
@meta-cognitive-architect I need to add authentication to the owner dashboard.

Requirements:
- Only role='owner' can access /owner/*
- Show current user info in header
- Redirect unauthenticated users to /login
- Enforce via middleware.ts

Background: Users table has role enum (source of truth)
```

**Step 2: Review Analysis Output**

Agent produces:
- Phase 1: Atomic decomposition (5 sub-domains, 15+ atomic units)
- Phase 2: Solutions with LCS scores (0.98, 0.92, 0.88, 0.85, 0.80)
- Phase 3: Adversarial audit (3 alternatives, 5+ assumptions, edge cases)
- Phase 4: Integration architecture, GCS calculation
- Phase 5: **GCS = 0.88 ✓ APPROVED**

Plus: Risk table, key decisions, next steps

**Step 3: Implement Using Next Steps**

Agent provides:
1. Create middleware auth check
2. Add role validation in /owner route
3. Implement auth context provider
4. Test with role=user, role=owner scenarios
5. Mobile testing + accessibility check
6. Commit: feat(auth): Add owner dashboard authentication

**Step 4: Execute Implementation**
```
@meta-cognitive-architect implement [approved analysis name]

[Agent produces production code + tests + quality checks]

Type checking: ✓ 0 errors
Linting: ✓ 0 errors
Tests: ✓ All passing

May I commit with message: feat(auth): Add owner dashboard authentication?
```

**Step 5: Commit**

Agent commits once you approve. Done!

---

### Scenario 2: Routine Task (Direct Fix)

**You have:** "Fix typo in PropertyCard.tsx - 'Proprety' should be 'Property'"

**What happens:**
```
@meta-cognitive-architect fix typo in PropertyCard.tsx

[Agent immediately fixes without reasoning overhead]

✓ Fixed typo "Proprety" → "Property" in 1 file

Type checking: ✓ 0 errors
Linting: ✓ 0 errors
```

**No 5-phase loop.** Just the fix. Efficient.

---

### Scenario 3: Execution (From Previous Analysis)

**You have:** Approved analysis GCS = 0.85+ from yesterday

**Step 1: Reference the Analysis**
```
@meta-cognitive-architect execute [previous analysis: PropertyInquiryForm]

Based on approved analysis (GCS: 0.85):

[Agent implements from scratch following all constraints]
```

**Step 2: Agent Produces:**
- Full PropertyInquiryForm component
- Zod validation schema
- Supabase integration
- Email notification retry logic
- Unit tests (all edge cases)
- Accessibility audit (WCAG 2.1 AA ✓)
- Mobile testing (320px, 375px, 768px ✓)
- Pre-commit verification (type check ✓, lint ✓)

**Step 3: Review & Commit**
```
I've implemented PropertyInquiryForm. 
Type checking and linting passed with zero errors. 
May I commit with: feat(property-detail): Add inquiry form with validation?

[Approve]

✓ Committed
```

---

## 📋 EXAMPLE WORKFLOW: Property Inquiry Form

### Request Analysis
```
@meta-cognitive-architect I need to add a property inquiry form.

Details:
- Users can inquire about properties
- Form: name, email, phone, message
- Validation: Nigerian phone (+234 format)
- Output: Save to DB + send confirmation email
- Requirements: Error handling, retry logic
```

### Agent Response

```
Running 5-phase analysis...

---
**[ANALYSIS COMPLETE]**

> **Core Problem:** Add inquiry form to property detail page with Nigerian phone validation
> **Global Confidence Score (GCS):** 0.85
> **Status:** APPROVED

## Decomposition
- Sub-domains: Form state, Validation, UI, DB insert, Email, Error handling
- Atomic units: 18 units identified
- LCS range: 0.78 - 0.95 (weakest: email dispatch)

## Confidence Scores
- Form state (React Hook Form): 0.92
- Validation schema (Zod): 0.95
- Phone regex (+234): 0.88
- Supabase insert: 0.88
- Email service: 0.78 (async, external dependency)
- Loading states: 0.85
**Weakest link:** Email dispatch

## Risks & Mitigations
| Risk | Mitigation | Score |
|------|-----------|-------|
| Email send failure | Retry logic + fallback alert | 0.85 |
| User not authenticated | Check auth context, redirect | 0.92 |
| XSS injection | Zod sanitization | 0.95 |
| DB constraint violation | Catch error, user feedback | 0.88 |
| Phone regex incorrect | Tested with +234 variants | 0.92 |

## Key Decisions
1. React Hook Form + Zod (consistent with RealEST patterns)
2. HeroUI Input, Textarea, Button (70% component usage)
3. Nigerian phone validation +234\d{10}
4. Email retry logic (prevents transient failures)
5. Loading state disables submit button

## Next Steps
1. Create InquiryForm component with validations
2. Add to property-detail/page.tsx
3. Test phone regex edge cases
4. Accessibility audit (aXe DevTools)
5. Mobile testing (320px, 375px, 768px)
6. Commit: feat(property-detail): Add inquiry form with validation

---
```

### Implement
```
@meta-cognitive-architect implement PropertyInquiryForm

[Agent produces complete implementation]

✅ InquiryForm.tsx (React Hook Form + Zod)
✅ tests/InquiryForm.test.tsx (edge cases, phone validation)
✅ Accessibility: WCAG 2.1 AA ✓ (aXe audit)
✅ Responsive: 320px, 375px, 768px ✓
✅ Dark mode: ✓
✅ Type checking: 0 errors ✓
✅ Linting: 0 errors ✓

Commit message ready: feat(property-detail): Add inquiry form with validation

May I commit?

[Approve]

✓ Committed successfully
```

---

## 🎓 DECISION MATRIX

| Task | Use Architect? | Expected Time |
|------|---|---|
| Add authentication | ✓ YES | 30-50 min analysis + 2 hrs implementation |
| Fix typo | ✗ NO | 1 min direct fix |
| Design new component | ✓ YES | 40 min analysis + 3 hrs implementation |
| Rename variable | ✗ NO | 2 min direct fix |
| Add form validation | ✓ YES | 35 min analysis + 2 hrs implementation |
| Update imports | ✗ NO | 5 min direct fix |
| Build API endpoint | ✓ YES | 45 min analysis + 3 hrs implementation |
| Add JSDoc comment | ✗ NO | 1 min direct fix |

---

## 💡 KEY CONCEPTS

### Confidence Scoring

**LCS (Local Confidence Score):** 0.0-1.0 per component
```
0.95-1.0: Bulletproof (enum-based, no branching, documented API)
0.85-0.94: High Confidence (clear types, minimal logic)
0.70-0.84: Moderate (some conditional logic, async operations)
0.50-0.69: Low (complex branching, unclear requirements)
< 0.50:   Red Flag (fundamental uncertainty)
```

**GCS (Global Confidence Score):** MIN(all LCS)
```
Why minimum? Your solution is only as strong as weakest link.

Example:
  Form component: 0.92
  Validation: 0.95
  DB insert: 0.88
  Email service: 0.78 ← Weakest
  GCS = 0.78 (below 0.85 threshold)
  
Status: RE-EVALUATE email service
Fix: Add retry logic
New Email LCS: 0.88
New GCS: 0.88 ✓ APPROVED
```

### 5-Phase Loop

**Phase 1: Decomposition** — Break problem into verifiable units  
**Phase 2: Execution** — Solve each unit, assign confidence  
**Phase 3: Audit** — Challenge your logic, find edge cases  
**Phase 4: Synthesis** — Integrate solutions, calculate confidence  
**Phase 5: Reflection** — Verify threshold (≥ 0.85) or re-evaluate

### Lowest-Link Principle

Your solution's confidence = confidence of weakest component

Not "average" (0.9 + 0.6 = 0.75 avg) but MIN (0.9, 0.6) = 0.6

Forces you to address all weak links before approval.

---

## ⚠️ COMMON QUESTIONS

### Q: Why does analysis take 30-50 minutes?
**A:** Deep reasoning prevents rework. 30 min analysis → prevents 3 hrs rework later.

### Q: What if my GCS is 0.80?
**A:** Below 0.85 threshold. Must re-evaluate weak links first. Agent will identify which components need improvement.

### Q: Can I skip the analysis?
**A:** Only for trivial tasks. Complex tasks need reasoning to avoid hallucinations.

### Q: What if re-evaluation doesn't improve GCS?
**A:** Agent stops, lists unresolvable gaps, asks you to clarify constraints. No infinite loops.

### Q: Does the analysis always result in APPROVED?
**A:** No. If GCS < 0.85 after re-evaluation, status is REJECTED. Agent lists gaps. You clarify, try again.

### Q: Can I use results from yesterday's analysis?
**A:** Yes. Reference it: "@meta-cognitive-architect execute [yesterday's analysis name]"

### Q: What if my task doesn't fit "trivial" or "complex"?
**A:** Agent asks clarifying questions. Better to ask than to guess.

### Q: Do I have to accept all recommendations?
**A:** No. Review the analysis, disagree if you want, ask agent to re-evaluate specific decisions.

---

## 🔗 FILE REFERENCE

| File | Purpose | When to Read |
|------|---------|---|
| **CORE-SKILL.md** | Decision routing, phase control | Agent reads (you don't) |
| **ANALYSIS-PROMPT.md** | 5-phase reasoning details | Agent reads (you don't) |
| **EXECUTION-PROMPT.md** | Implementation constraints | Agent reads (you don't) |
| **README.md** | This file - usage guide | You read this! |

---

## 🎯 ACTIVATION CHECKLIST

To use Meta-Cognitive Architect:

- [x] Understand when to use (complex tasks)
- [x] Know how to trigger (@meta-cognitive-architect [task])
- [x] Review output format (5 phases + confidence score)
- [x] Understand GCS ≥ 0.85 threshold
- [x] Know to implement after approval

---

## 📞 WORKFLOW QUICK REFERENCE

```
Complex Task:
  1. @meta-cognitive-architect [describe task]
  2. Agent: "Running 5-phase analysis..."
  3. Receive: Analysis output + GCS
  4. If GCS ≥ 0.85: Ask for implementation
  5. Agent: Produces code + tests
  6. Approve commit

Routine Task:
  1. @meta-cognitive-architect [describe fix]
  2. Agent: "Direct fix applied"
  3. Done

From Previous Analysis:
  1. @meta-cognitive-architect execute [analysis name]
  2. Agent: Produces implementation
  3. Approve commit
```

---

## 🏆 SUCCESS INDICATORS

You know the system is working when:

```
✓ Complex tasks produce clear GCS with reasoning
✓ Confidence scores are justified, not guesses
✓ Weak links are identified and mitigated
✓ Implementation follows all analysis constraints
✓ Code passes type checking + linting
✓ Tests cover all edge cases from analysis
✓ Fewer rework cycles (decisions are verified)
✓ Team gains confidence in architectural decisions
```

---

## 📈 EXPECTED IMPACT

### Before (without Meta-Cognitive Architect)
```
1. "Build authentication" → Implement → TypeScript errors
2. "Fix errors" → Refactor → Missed edge cases
3. "Test finds issues" → Rework → 3 weeks elapsed
4. Deploy → Bug in production
```

### After (with Meta-Cognitive Architect)
```
1. "Build authentication" → Deep analysis (40 min)
2. "Review analysis" → GCS = 0.88 ✓ Approved
3. "Implement following analysis" → 2 hrs, all constraints covered
4. "Tests pass, type check passes" → Deploy confident
5. No production bugs (edge cases handled)
```

---

## 🚀 GETTING STARTED

### Your First Task

Pick a **complex task** you've been thinking about:

```
@meta-cognitive-architect [your complex task description]

Watch agent:
1. Classify as "complex"
2. Run 5-phase analysis
3. Produce confidence score
4. Give you clear next steps

Review results:
- Are the 5 phases present?
- Is confidence justified?
- Do next steps make sense?

If GCS ≥ 0.85:
  → Ask agent to implement
  → Review code
  → Approve commit

Done!
```

---

**Questions?** Review the relevant .md file above.  
**Ready to use?** Start with `@meta-cognitive-architect [your task]`  

🧠 You now have a System 2 thinking partner. Good luck! ✨
