---
name: meta-cognitive-system
version: 1.0.0
category: Reasoning & Analysis Framework
applies_to: **/*.{ts,tsx,md,js,jsx}
trigger: complex-decision, architecture, cross-domain, type-design, strategic
---

# 🧠 Meta-Cognitive Reasoning System - MASTER INTEGRATION

**Integration Version:** 1.0.0  
**Status:** ACTIVE - Default entry point for all complex RealEST tasks  
**Maintained by:** Development Team  

---

## 🎯 SYSTEM PURPOSE

This **MASTER instruction file** integrates the **Meta-Cognitive Architect** skill as the default reasoning framework for all coding agents working on RealEST. It ensures every complex decision receives deep analytical treatment before implementation, eliminating hallucinations and verifying assumptions.

**Philosophy:** *Never provide first-guess responses. Always use deliberate, high-rigor System 2 thinking.*

---

## 📋 ACTIVATION RULES

### AUTO-INVOKE Triggers (Mandatory)

The Meta-Cognitive Architect **MUST** be invoked (either automatically or manually requested) for:

#### 1. **Architectural Decisions**
- New feature affecting 3+ systems
- Database schema changes
- API endpoint design
- Component hierarchy redesign
- Authentication/authorization changes
- Cross-module dependency additions

**Example:** "Should we use Supabase Real-time or polling for property status updates?"  
→ *Auto-invoke Meta-Cognitive Architect*

#### 2. **Complex Type System Design**
- New TypeScript interfaces with nested relationships
- Zod schema architecture
- Type inference across boundaries
- API response mapping strategies
- Database row-to-UI mapping

**Example:** "How do we model user roles considering single-source-of-truth on users.role?"  
→ *Auto-invoke Meta-Cognitive Architect*

#### 3. **Nigerian Market Domain Logic**
- Infrastructure mapping (NEPA, water, security)
- Localization features (state/LGA cascading)
- Phone number validation patterns
- Currency formatting rules
- Cultural sensitivity considerations

**Example:** "What's the best way to handle BQ availability across property types?"  
→ *Auto-invoke Meta-Cognitive Architect*

#### 4. **Design System Compliance**
- New component design (HeroUI v3 vs custom)
- Color token usage in novel contexts
- Typography hierarchy decisions
- Responsive design strategy for new content types
- Dark mode + theme provider interactions

**Example:** "How should we style the admin verification dashboard?"  
→ *Auto-invoke Meta-Cognitive Architect*

#### 5. **Data Flow & State Management**
- Form pattern for new use case
- Real-time subscription architecture
- Caching strategy
- Error handling framework
- Loading state patterns

**Example:** "How should property inquiry form handle submit state + optimistic updates?"  
→ *Auto-invoke Meta-Cognitive Architect*

#### 6. **Cross-Domain Integration**
Any task involving 2+ of these domains:
- Authentication + Authorization + Route Protection
- Design System + Component Library + UI Implementation
- Database Schema + API Endpoints + Type System
- Nigerian Market Context + Feature Design + Localization
- Form Patterns + Validation + Type Safety

**Example:** "Build owner dashboard with role-based access and property filtering"  
→ *Auto-invoke Meta-Cognitive Architect*

---

### SKIP Triggers (Use direct implementation)

Do NOT invoke for these scenarios:

```yaml
✗ Simple Fixes:
  - Typo corrections
  - Single-line bug patches
  - CSS adjustments (already designed)
  - Import statement updates
  - Variable renames

✗ Well-Isolated Tasks:
  - Documentation updates
  - Test writing (after design approved)
  - Dependency upgrades
  - Build configuration changes
  - Pre-commit workflow

✗ Trivial Decisions:
  - Naming consistency
  - File organization within established patterns
  - Code formatting
  - Comment additions
  - Example code

⚠️ Partial Invoke Cases:
  - "Implement [previously analyzed] component" → Skip to Execution Prompt
  - "Fix bug in [well-documented] component" → Direct debugging
  - "Add test coverage to [existing] feature" → Direct test writing
```

---

## 🔄 INTEGRATION WORKFLOW

### Step 1: Receive Task Request

Agent receives task from user:
```
"I need to add a property inquiry form to the property detail page"
```

### Step 2: Classify Task Complexity

Ask: Does this task fit **AUTO-INVOKE triggers**?

```yaml
Checklist:
□ Affects 3+ systems? (Form + DB + Email)
□ New component design? (PropertyInquiryForm)
□ Involves validation? (Zod + React Hook Form)
□ Uses Nigerian context? (Phone format +234)
□ Integrates design system? (HeroUI + colors)
□ Cross-domain? (Form + Auth + Email)

Result: ✓ YES → Invoke Meta-Cognitive Architect
```

### Step 3: Invoke Meta-Cognitive Architect

**Command for Agent:**
```
@meta-cognitive-architect

TASK: Add property inquiry form to property detail page

CONTEXT:
- Users can submit inquiries about properties
- Form: name, email, phone, message
- Validation: Nigerian phone (+234 format)
- Output: Save to DB, send confirmation email

REFERENCE: This is a complex, cross-domain task requiring deep analysis.
Use the full 5-phase Recursive Reasoning Loop.
```

### Step 4: Receive & Review Analysis

Agent produces:
- **PHASE 1:** Atomic decomposition (scope, MECE, DAG)
- **PHASE 2:** Bayesian execution (LCS scores)
- **PHASE 3:** Adversarial audit (bias, edge cases)
- **PHASE 4:** Synthesis (GCS calculation)
- **PHASE 5:** Reflection (threshold check)

**Output includes:**
```
---
**[ANALYSIS COMPLETE]**
> **Global Confidence Score:** 0.85+
> **Status:** APPROVED FOR EXECUTION
> **Key Decisions:** [decisions]
> **Risks & Mitigations:** [table]
> **Next Steps:** [action items]
```

### Step 5: Conditional Proceed

```
IF GCS ≥ 0.85:
  → Proceed to EXECUTION phase
  → Follow "Next Steps" from analysis
  → Use Execution Prompt

ELSE (GCS < 0.85):
  → Review weak links identified
  → Request re-evaluation on specific sub-problems
  → Only proceed after GCS ≥ 0.85
```

### Step 6: Execute Implementation

Follow the **Execution Prompt** template:

```
Based on Meta-Cognitive Analysis [task name]:

GCS: 0.85+
STATUS: APPROVED FOR EXECUTION

Now implement with:
- TypeScript strict mode (no 'any')
- HeroUI v3 patterns (70% usage)
- Nigerian market context
- CSS token system from styles/tokens/colors.css
- Types from lib/supabase/types.ts
- WCAG 2.1 AA accessibility
- Mobile testing (320px, 375px, 768px, 1024px)

DELIVERABLES:
1. Code implementation
2. Edge case tests
3. Accessibility audit
4. Mobile responsiveness check
5. Pre-commit checks: npx tsc --noEmit && npm run lint
```

### Step 7: Quality Assurance

Before commit, follow **AI-COMMIT-RULES.md**:
```bash
1. npx tsc --noEmit              # Zero TypeScript errors
2. npm run lint                  # Zero lint errors
3. Ask user for explicit consent
4. git commit -m "[conventional]"
```

---

## 🛠️ TWO-PROMPT OPERATING SYSTEM

### Prompt 1: ANALYSIS (System 2 - Slow, Deep)

**Usage:** When task requires reasoning before implementation

```markdown
You are operating the Meta-Cognitive Architect mode.

TASK: [Complex task description]

EXPECTED EXECUTION:
1. PHASE 1: Atomic Decomposition
   - Define scope (True North, Out-of-Scope)
   - MECE partitioning (all cases, no overlap)
   - Atomic reduction (single logic operations)
   - Dependency DAG (execution order)

2. PHASE 2: Bayesian Execution
   - Solve each atomic unit independently
   - Assign Local Confidence Score (LCS) to each (0.0-1.0)
   - Cite knowledge/logic for every claim

3. PHASE 3: Adversarial Audit
   - Challenge confirmation bias
   - Identify hidden assumptions
   - Test logical leaps
   - Analyze edge cases (5+)
   - Adjust LCS if weaknesses detected

4. PHASE 4: Synthesis & Integration
   - Assemble atomic solutions
   - Calculate Global Confidence Score (GCS) via Lowest-Link Principle
   - Integration checklist (10+ items)

5. PHASE 5: Recursive Reflection
   - IF GCS < 0.85: RE-EVALUATE weak links
   - Document re-evaluation results
   - Finalize GCS when threshold met

OUTPUT FORMAT:
End with metadata block:
---
**[ANALYSIS COMPLETE]**
> **Core Problem:** [1-sentence]
> **Global Confidence Score:** [0.0-1.0]
> **Status:** [APPROVED / RE-EVALUATING / REJECTED]
> **Key Decisions:** [3-5 bullets]
> **Risks & Mitigations:** [table format]
> **Logic Path:** [Summary of decomposition → solution → verification]
> **Next Steps:** [Action items for implementation]

CONFIDENCE THRESHOLD: 0.85
If GCS < threshold, you MUST re-evaluate before finalizing.

REALEST CONTEXT:
- Tech: Next.js 16, React 19, HeroUI v3 (70%), Supabase
- Design: 60-30-10 color rule, OKLCH tokens, 4-tier typography
- Domain: Nigerian property marketplace, verification-first
- Constraints: Strict TypeScript, WCAG 2.1 AA, Mobile-first
```

### Prompt 2: EXECUTION (System 1 - Fast, Action)

**Usage:** When analysis is complete and GCS ≥ 0.85

```markdown
EXECUTION MODE ACTIVATED

Analysis Reference: [Task name]
Global Confidence Score: [0.85+]
Status: APPROVED FOR EXECUTION

Now implement the approved solution.

CONSTRAINTS:
- TypeScript strict mode enabled (npx tsc --noEmit)
- Use HeroUI v3 from @heroui/react (70% of components)
- Type definitions from lib/supabase/types.ts
- Color tokens from styles/tokens/colors.css
- Nigerian market context in feature design
- Accessibility: WCAG 2.1 AA standard
- Responsive: Mobile-first approach (320px+)
- Dark mode: useRealEstTheme() hook required
- Testing: Cover all edge cases from analysis

IMPLEMENTATION CHECKLIST:
☐ Code implementation (all types explicit)
☐ Edge case handling (from Phase 3)
☐ Unit tests (critical paths)
☐ Accessibility audit (aXe DevTools)
☐ Mobile testing (320px, 375px, 768px, 1024px)
☐ Type checking: npx tsc --noEmit → 0 errors
☐ Linting: npm run lint → 0 errors
☐ Request user consent before commit
☐ Commit with conventional format

DELIVERABLES:
1. Fully typed, production-ready code
2. Test coverage for edge cases
3. Accessibility compliance verification
4. Mobile responsiveness confirmation
5. Pre-commit checks passing

Upon completion, ask user:
"I've implemented [feature]. Type checking and linting passed with zero errors. 
May I commit these changes with the message: [commit message]?"
```

---

## 🎓 REALEST-SPECIFIC REASONING CONTEXT

### Architecture Context
```yaml
# System Design
Frontend:
  Framework: Next.js 16 (App Router)
  React: v19 with Server Components
  TypeScript: Strict mode, no 'any'
  Components: 70% HeroUI v3, 25% UntitledUI, 5% Custom
  Styling: Tailwind CSS v4 + CSS custom properties

Backend:
  Database: Supabase PostgreSQL + PostGIS
  Auth: Supabase Auth (role: user|owner|agent|admin)
  Real-time: Supabase Realtime subscriptions
  Storage: Supabase Storage for images/documents

# Design System
Color Rule: 60-30-10
  Primary Dark: #07402F (foundation)
  Primary Neutral: #2E322E (secondary)
  Primary Accent: #ADF434 (verification signals, CTAs)

Typography: 4-tier
  Display: Lufga
  Heading: Neulis Neue
  Body: Space Grotesk
  Mono: JetBrains Mono

# Domain
Nigerian Market:
  Property types: BQ, self-contained, face-me-I-face-you
  Infrastructure: NEPA, water, internet, security
  Location: 36 states + FCT, LGA
  Currency: Naira (₦) formatting
  Phone: +234 format
  Cultural: Green = national pride, verification = trust
```

### Decision Trees for Common Patterns

```yaml
Component Selection:
  If UI element with styling:
    If form control (input, select, button):
      → Use HeroUI v3 from @heroui/react (70% target)
    If status indicator (badge, chip):
      → Use HeroUI v3 or UntitledUI (25% target)
    If custom complex pattern:
      → Consider HeroUI compounds + CSS overrides
      → Fallback: Custom with Tailwind (5% max)
  
  If design token needed:
    → Check styles/tokens/colors.css first (source of truth)
    → Use CSS custom properties (--color-name)
    → Use Tailwind semantic classes (bg-primary, text-foreground)
    → Never hardcode hex colors

Form Architecture:
  If capturing user input:
    → React Hook Form (state management)
    → Zod (validation schema)
    → HeroUI Input/Textarea/Select (UI)
    → Real-time validation feedback
    → Nigerian context (phone +234, state/LGA cascades)

Authentication:
  If protecting route:
    → Check middleware.ts route access logic
    → Verify current app mode (coming-soon, full-site, development)
    → Use getCurrentUser() for auth check
    → Check role from users.role (single source of truth)
    → Enforce RLS policies on backend

Type Design:
  If modeling entity:
    → Check lib/supabase/types.ts (auto-generated from schema)
    → Create Zod schema for validation
    → Use type inference (typeof, Parameters, ReturnType)
    → Avoid 'any' at all costs
    → Test with Nigerian market data (edge cases)
```

---

## 📊 CONFIDENCE SCORING REFERENCE

### Local Confidence Score (LCS) Rubric

```
1.0 - 0.95: BULLETPROOF
  - Enum-based logic, no branching
  - API well-documented (HeroUI, Supabase)
  - No external dependencies
  - Tested precedent in codebase
  Examples: Color mapping, type validation, string formatting

0.94 - 0.85: HIGH CONFIDENCE
  - Clear type system support
  - Minimal branching logic
  - Component API well-understood
  - Similar patterns exist in codebase
  Examples: Form component, data fetching, component composition

0.84 - 0.70: MODERATE CONFIDENCE
  - Conditional logic required
  - Some async operations
  - Assumptions about data structure
  - Limited codebase precedent
  Examples: Complex form validation, state synchronization, error recovery

0.69 - 0.50: LOW CONFIDENCE
  - Multiple branching paths
  - Unclear requirements
  - Assumptions about external APIs
  - No precedent in codebase
  Examples: New architecture pattern, novel feature design, edge case handling

< 0.50: RED FLAG
  - Fundamental uncertainty
  - Requires additional research
  - Propose alternative approach
  - Flag for senior review
```

### Global Confidence Score (GCS) Calculation

```
GCS = MINIMUM(All Local Confidence Scores)

Why minimum?
- System is only as strong as weakest link
- Forces addressing all weak sub-problems
- Ensures holistic quality

Threshold:
- GCS ≥ 0.85 → APPROVED FOR EXECUTION
- GCS < 0.85 → RE-EVALUATE weak links
- Target: 0.90+ for mission-critical systems

Examples:
  GCS = MIN(0.98, 0.92, 0.88, 0.87, 0.85, 0.80)
  GCS = 0.80 → Below threshold, re-evaluate email notification (0.80)

  After adding retry logic:
  GCS = MIN(0.98, 0.92, 0.88, 0.87, 0.85, 0.88)
  GCS = 0.85 → Meets threshold, approved
```

---

## 🚨 ANTI-PATTERNS TO AVOID

### When Agent is Tempted to Skip Analysis

```yaml
❌ WRONG: "This is simple, I'll just code it"
✅ RIGHT: Classify complexity first, then skip analysis if truly trivial

❌ WRONG: "I've built similar components, I know the pattern"
✅ RIGHT: Even familiar tasks warrant analysis if cross-domain

❌ WRONG: "The user asked for code, not analysis"
✅ RIGHT: Deep analysis produces better code faster

❌ WRONG: "Analysis paralysis - let's just start"
✅ RIGHT: 30 min analysis prevents 3 hours of rework

❌ WRONG: "I'll analyze as I code"
✅ RIGHT: Analysis BEFORE code prevents logical fallacies
```

### When Analysis is Insufficient

```yaml
❌ WRONG: "GCS = 0.78, that's close enough to proceed"
✓ RIGHT: "GCS < 0.85, must re-evaluate weak links first"

❌ WRONG: "I identified the risk but won't document it"
✓ RIGHT: "Document all risks in analysis for future reference"

❌ WRONG: "Skip Phase 3 (adversarial audit) to save time"
✓ RIGHT: "Phase 3 finds 80% of edge cases, saves rework"

❌ WRONG: "User didn't ask for edge cases, skip Phase 3"
✓ RIGHT: "Hidden edge cases cause production bugs, always audit"
```

---

## 📖 INTEGRATION WITH EXISTING INSTRUCTION SYSTEM

### Instruction Hierarchy (Updated)

```
RealEST Instruction Pyramid (with Meta-Cognitive Layer)

                    ┌──────────────────────────┐
                    │  Meta-Cognitive System   │
                    │  (This file - MASTER)    │ ← ACTIVATION RULES
                    └────────────┬─────────────┘
                                 │
                  ┌──────────────┼──────────────┐
                  │              │              │
        ┌─────────▼────┐   ┌─────▼─────┐   ┌──▼────────────┐
        │ Architecture │   │ Component  │   │ Authentication│
        │ Overview     │   │ Library    │   │ & Security    │
        └────┬─────────┘   └──────┬─────┘   └────┬──────────┘
             │                    │              │
        ┌────▼────────────────────▼──────────────▼─────┐
        │  Design System + Nigerian Market + Types    │
        │  + Email System + Form Patterns              │
        └─────────┬──────────────────────────────────┘
                  │
        ┌─────────▼──────────┐
        │   PROMPTS.md       │
        │ (Battle-tested)    │
        └─────────┬──────────┘
                  │
        ┌─────────▼──────────┐
        │ AI-COMMIT-RULES    │
        │ (Pre-commit QA)    │
        └────────────────────┘

```

### Interaction with Existing Files

| File | Integration | Usage |
|------|-------------|-------|
| `00-architecture-overview.md` | High-level context for Phase 1 (scope) | Decomposition reference |
| `01-design-system.md` | Decision criteria for styling sub-problems | Design phase guidance |
| `02-component-library.md` | HeroUI patterns, component selection logic | Synthesis reference |
| `03-typescript-types.md` | Type design patterns, schema reference | Type safety verification |
| `04-authentication.md` | Auth patterns, RLS logic, middleware rules | Auth sub-problem solving |
| `05-nigerian-market.md` | Domain-specific context, localization rules | Nigerian context validation |
| `PROMPTS.md` | Battle-tested templates, execution examples | Reference for analogous tasks |
| `AI-COMMIT-RULES.md` | Pre-commit checks, conventional commits | Phase 5+ quality gates |

**Flow:**
1. Meta-Cognitive System (this file) activates and classifies task
2. Invoke Architect skill for analysis (uses context from 00-05)
3. Generate deep analysis output (Phases 1-5)
4. Agent proceeds to implementation using execution prompt
5. Agent enforces AI-COMMIT-RULES before finalizing

---

## 🎯 ACTIVATION EXAMPLES

### Example 1: INVOKE Meta-Cognitive Architect

**User Request:**
```
"I need to add authentication to the owner dashboard. 
Users with role='owner' can view their properties and inquiries."
```

**Agent Classification:**
```
✓ Affects 3+ systems: Route protection, auth context, role checking
✓ Involves middleware: Middleware.ts route access control
✓ Cross-domain: Auth + Design + DB schema (users.role)
✓ Nigerian context: Owner vs user role distinction
✓ Type design: UserRole enum, RLS policies

Decision: INVOKE META-COGNITIVE ARCHITECT
```

**Agent Invocation:**
```
@meta-cognitive-architect 

TASK: Add authentication to owner dashboard

REQUIREMENTS:
- Only users with role='owner' can access /owner/*
- Check current user from auth context
- Verify role from users.role (not profiles.user_type)
- Enforce via middleware.ts route protection
- Redirect unauthenticated users to /login
- Display user profile info in dashboard header

CONTEXT:
- Authentication: Supabase Auth with role-based access
- Design: RealEST theme provider, HeroUI v3 components
- Database: users.role is single source of truth
- Precedent: Similar protection in /admin routes

Use full Recursive Reasoning Loop. Analyze authentication flow,
role checking strategy, middleware enforcement, type safety.
```

**Expected Analysis Output:**
```
---
**[ANALYSIS COMPLETE]**

## PHASE 1: Atomic Decomposition
Scope: Protect /owner routes, enforce role-based access...
MECE: [Route protection, Auth context, Role validation, UI display]
Atomic Units: [Session verification, Role enum check, Route redirect, ...]
DAG: [Session → Role check → Route access → Content rendering]

## PHASE 2: Bayesian Execution
[Sub-problem solutions with LCS scores]
- Session verification: LCS 0.98
- Role checking: LCS 0.95
- Middleware enforcement: LCS 0.92
- Type safety: LCS 0.96
- Error handling: LCS 0.88

## PHASE 3: Adversarial Audit
[Bias checks, hidden assumptions, edge cases]
- Assumption: "Role is always present" → Add null check
- Edge case: "User role changes mid-session" → Add auth state listener
- Logical leap: "Middleware covers all routes" → Verify route coverage

## PHASE 4: Synthesis
[Integration architecture, component composition]
GCS = 0.88 ✓ (above 0.85 threshold)

## PHASE 5: Reflection
[Threshold check, finalization]
All weak links mitigated. GCS: 0.88 APPROVED.

---

**[ANALYSIS COMPLETE]**
> **Global Confidence Score:** 0.88
> **Status:** APPROVED FOR EXECUTION
> **Key Decisions:**
>   1. Use middleware.ts for route-level protection
>   2. Fetch role from users.role (single source of truth)
>   3. Add null check for missing auth context
>   4. Implement role-based redirect to /login
> **Risks & Mitigations:** [table with 5 risks]
> **Next Steps:** [Implementation steps]
```

### Example 2: SKIP Meta-Cognitive Architect

**User Request:**
```
"Can you fix the typo in PropertyCard component? 
'Proprety' should be 'Property'"
```

**Agent Classification:**
```
✗ Simple fix: Single word replacement
✗ Well-isolated: No cross-domain impact
✗ Trivial: No architectural decision required

Decision: SKIP META-COGNITIVE ARCHITECT, direct implementation
```

**Agent Response:**
```
I'll fix the typo in the PropertyCard component.

[Directly implements fix, commits with: fix(property-card): correct spelling]
```

### Example 3: PARTIAL INVOKE

**User Request:**
```
"I have an approved analysis for the inquiry form. 
Now implement the component with all validations."
```

**Agent Classification:**
```
✓ Analysis previously approved: GCS 0.85+
✓ Ready for execution phase
✓ Skip full reasoning loop

Decision: USE EXECUTION PROMPT (Prompt 2)
```

**Agent Invocation:**
```
Based on approved Meta-Cognitive Analysis (Inquiry Form):

GCS: 0.85 ✓
STATUS: APPROVED FOR EXECUTION

Now implement the PropertyInquiryForm component with:
- React Hook Form + Zod validation
- HeroUI Input, Textarea, Button
- Nigerian phone format (+234)
- Supabase insert + error handling
- Email notification with retry
- Loading states + user feedback

[Executes implementation following Execution Prompt guidelines]
```

---

## ✅ QUALITY GATES

### Before Analysis Output

```
IF task is genuinely complex:
  ✓ Produced all 5 phases (Decomposition → Execution → Audit → Synthesis → Reflection)
  ✓ Documented LCS for every sub-problem
  ✓ Performed adversarial audit (bias, assumptions, edge cases)
  ✓ Calculated GCS using Lowest-Link Principle
  ✓ Identified all risks and mitigations
  ✓ Provided clear Next Steps for implementation
  
ELSE:
  ✗ Analysis is incomplete or too shallow
  → Re-run with full protocol
```

### Before Execution Output

```
IF analysis GCS ≥ 0.85:
  ✓ Proceed with implementation using Execution Prompt
  ✓ Follow edge case handling from Phase 3
  ✓ Enforce type safety (no 'any')
  ✓ Include all tests from analysis
  
ELSE (GCS < 0.85):
  ✗ Cannot execute yet
  → Must re-evaluate weak links
  → Request clarification on unclear requirements
  → Propose alternative approaches
```

### Before Commit

```
Enforce AI-COMMIT-RULES.md:

✓ npx tsc --noEmit → 0 TypeScript errors
✓ npm run lint → 0 lint errors
✓ All modified files checked for errors
✓ User explicitly approves commit message
✓ Conventional commit format: [type(scope): subject]

→ ONLY THEN commit
```

---

## 🔗 QUICK REFERENCE LINKS

- **Meta-Cognitive Architect Skill:** `.agents/skills/meta-cognitive-architect/` (modular: CORE-SKILL.md, ANALYSIS-PROMPT.md, EXECUTION-PROMPT.md, README.md)
- **Architecture Overview:** `.github/copilot-instructions/00-architecture-overview.md`
- **Design System:** `.github/copilot-instructions/01-design-system.md`
- **Component Library:** `.github/copilot-instructions/02-component-library.md`
- **TypeScript Types:** `.github/copilot-instructions/03-typescript-types.md`
- **Authentication:** `.github/copilot-instructions/04-authentication.md`
- **Nigerian Market:** `.github/copilot-instructions/05-nigerian-market.md`
- **Prompts Library:** `.github/copilot-instructions/PROMPTS.md`
- **Commit Rules:** `.github/copilot-instructions/AI-COMMIT-RULES.md`

---

## 📊 SYSTEM METRICS

### Confidence Score Calibration

The system is calibrated for RealEST's tech stack and domain:

| Task Category | Typical GCS Range | Threshold |
|---------------|------------------|-----------|
| Component design | 0.85-0.92 | 0.85 |
| API endpoint | 0.83-0.90 | 0.85 |
| Type system | 0.88-0.96 | 0.90 |
| Database schema | 0.90-0.98 | 0.92 |
| Bug fix (complex) | 0.80-0.88 | 0.80 |
| Feature flag | 0.75-0.85 | 0.75 |
| Routine task | N/A | N/A (skip analysis) |

### Expected Time Investment

| Phase | Typical Duration | Purpose |
|-------|-----------------|---------|
| Phase 1 (Decomposition) | 10-15 min | Map problem space |
| Phase 2 (Execution) | 5-10 min | Solve sub-problems |
| Phase 3 (Audit) | 8-12 min | Challenge logic |
| Phase 4 (Synthesis) | 5-8 min | Integrate & score |
| Phase 5 (Reflection) | 3-5 min | Threshold check |
| **Total Analysis** | **30-50 min** | Deep reasoning loop |
| **Implementation** | **1-3 hours** | Code + tests |
| **Saved by prevention** | **2-4 hours** | Fewer rework cycles |

---

## 🚀 ACTIVATION CHECKLIST

For RealEST development teams:

- [ ] Save this MASTER file in `.github/copilot-instructions/`
- [ ] Ensure Meta-Cognitive Architect skill is installed (`.agents/skills/meta-cognitive-architect/` with modular files)
- [ ] Agents are configured to check this file on startup
- [ ] Team understands AUTO-INVOKE triggers
- [ ] Team knows when to skip analysis (simple tasks)
- [ ] Team reviews analysis outputs before proceeding
- [ ] AI-COMMIT-RULES.md is enforced (type check + lint)
- [ ] GCS ≥ 0.85 threshold is respected
- [ ] Deep reasoning loop is treated as standard practice, not overhead

---

## 📝 USAGE NOTES

### For Agents

```typescript
// On task receipt:
if (isComplexTask(task)) {
  return await invokeMetaCognitiveArchitect(task)
} else {
  return await implementDirectly(task)
}

// After analysis:
if (analysis.gcs >= 0.85) {
  return await executeImplementation(analysis)
} else {
  return await requestReEvaluation(analysis.weakLinks)
}

// Before commit:
await enforceCommitRules()
  .then(() => askUserConsent())
  .then(() => commit())
```

### For Developers

```markdown
When working on RealEST:

1. **Complex task?** → Request Meta-Cognitive Analysis
2. **Received analysis?** → Review GCS and key decisions
3. **GCS ≥ 0.85?** → Proceed to implementation
4. **Implementing?** → Follow Next Steps from analysis
5. **Before committing?** → Run type check + lint
6. **Questions?** → Reference architecture docs + analysis output
```

---

**END OF MASTER INTEGRATION FILE**

---

## 🎯 FINAL ACTIVATION COMMAND

```bash
# To activate this system for your agents:
1. Copy this file to: .github/copilot-instructions/META-COGNITIVE-SYSTEM.md
2. Ensure skill installed: .agents/skills/meta-cognitive-architect/ (CORE-SKILL.md + companion prompts)
3. Add to agent startup checklist
4. Reference in copilot-instructions.md main index
5. Agents now use Meta-Cognitive reasoning for complex tasks ✓
```

**Your RealEST agents now have a System 2 thinking framework.** 🧠✨  
*Never again settle for first-guess responses on complex decisions.*
