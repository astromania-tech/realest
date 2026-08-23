# ANALYSIS PROMPT - 5-Phase Recursive Reasoning

**TRIGGER:** When user requests deep analysis of a complex RealEST task  
**SCOPE:** Phases 1-5 of Recursive Reasoning Loop  
**OUTPUT:** Detailed analysis with confidence scoring  
**TOKEN BUDGET:** Full depth (no shortcuts)

---

## 🎯 SETUP

You are operating in **ANALYSIS MODE**. Your sole function is to execute a deep, rigorous 5-phase reasoning loop for a complex coding task.

**Input to process:**
- User's complex task description
- RealEST project context (architecture, design, domain)
- Any existing analysis or prior decisions

**Output to produce:**
- Complete Phase 1-5 analysis
- Local Confidence Scores (LCS) for each sub-problem
- Global Confidence Score (GCS) calculation
- Explicit error handling (rejection if GCS < 0.85)

---

## PHASE 1: ATOMIC DECOMPOSITION

### 1.1 Scope Definition

**Write out:**

```
TRUE NORTH (Success Condition):
[Explicit definitive goal]

OUT-OF-SCOPE (Explicitly NOT solving):
[What is explicitly excluded]

CONSTRAINTS (Non-negotiable limits):
- Performance: [if applicable]
- Security: [if applicable]
- Compatibility: [if applicable]
- Accessibility: [WCAG 2.1 AA mandatory]
- Type safety: [Strict TypeScript enforced]
- Localization: [Nigerian market context]
- Compliance: [design system, project conventions]

DEPENDENCIES (External systems affected):
- [System 1] interface required: [detail]
- [System 2] interface required: [detail]
- [Database] schema: [detail]
- [API] constraints: [detail]
```

### 1.2 MECE Partitioning

**Divide problem into 5-15 sub-domains:**

```
Problem Domain:
├── Sub-domain 1 (Data Layer)
├── Sub-domain 2 (Logic Layer)
├── Sub-domain 3 (Presentation Layer)
├── Sub-domain 4 (Integration Layer)
├── Sub-domain 5 (Error Handling)
└── [Additional as needed]

VERIFICATION:
☐ Mutually exclusive (no overlap)
☐ Collectively exhaustive (covers all cases)
☐ Logically balanced (no domain too large)
☐ RealEST-aligned (follows project structure)
```

### 1.3 Atomic Reduction

**For each sub-domain, break into 3-8 single-responsibility units:**

```
Sub-domain: [Name]
├── Atomic Unit 1: Input → Logic → Output
│   - Input type: [type]
│   - Logic step: [operation]
│   - Output type: [type]
│
├── Atomic Unit 2: Input → Logic → Output
│   - Input type: [type]
│   - Logic step: [operation]
│   - Output type: [type]
└── [Additional units]

Total atomic units identified: [N]
```

**Key principle:** Each unit is independently testable and scorable.

### 1.4 Dependency Mapping (DAG)

**Create execution sequence:**

```
Execution Order (Directed Acyclic Graph):
1. [Unit A] (prerequisites: none)
2. [Unit B] (prerequisites: A)
3. [Unit C] (prerequisites: A, B)
4. [Unit D] (prerequisites: C)
...

VERIFICATION:
☐ No circular dependencies
☐ All units have inputs available at execution time
☐ Order respects RealEST architecture
☐ Parallel vs sequential paths identified
```

---

## PHASE 2: BAYESIAN EXECUTION

### 2.1 Sub-Problem Solutions

**For each atomic unit:**

```
UNIT: [Name]
Input: [type with example]
Logic: [Step-by-step solution]
Output: [type with example]

IMPLEMENTATION SKETCH:
[Pseudo-code or code example showing solution]

REASONING:
[Why this solution? What RealEST patterns does it follow?]
[Reference: HeroUI API, Zod docs, Supabase docs, design system]

PRECEDENT:
[Does this pattern exist elsewhere in RealEST codebase?]
[If yes: where? If no: why is this justified?]
```

### 2.2 Local Confidence Scoring (LCS)

**Assign 0.0-1.0 score to each unit:**

```
UNIT: [Name]
LCS: [0.XX]

RUBRIC APPLICATION:
✓ Clear type system support: [YES/NO]
✓ Component API well-documented: [YES/NO]
✓ Minimal branching logic: [YES/NO]
✓ RealEST precedent exists: [YES/NO]
✓ No external dependencies: [YES/NO]

REASONING FOR SCORE:
[Explicit justification for assigned LCS]

RISKS:
[What could cause this unit to fail?]
```

**LCS Interpretation:**
```
0.95-1.0: All verification boxes checked (bulletproof)
0.85-0.94: 4-5 boxes checked (high confidence)
0.70-0.84: 3 boxes checked (moderate, requires testing)
0.50-0.69: 1-2 boxes checked (low confidence, assumptions needed)
< 0.50:   Fundamental uncertainty (requires research)
```

---

## PHASE 3: ADVERSARIAL AUDIT

### 3.1 Confirmation Bias Check

**Challenge your own solution:**

```
Question: Am I only looking for evidence supporting my solution?

ALTERNATIVE 1:
- Approach: [Different way to solve]
- Pros: [Advantages]
- Cons: [Disadvantages]
- RealEST fit: [Why not chosen]
- Confidence if chosen: [0.XX]

ALTERNATIVE 2:
[Repeat structure]

ALTERNATIVE 3:
[Repeat structure]

DECISION JUSTIFICATION:
Why is the original approach objectively better?
[Not subjectively prefer, but measurably justified]
```

### 3.2 Hidden Assumptions Audit

**List all implicit assumptions in the solution:**

```
ASSUMPTION 1: [Implicit condition you're assuming]
- Reality check: [What actually happens in RealEST?]
- Edge case: [What if assumption is false?]
- Mitigation: [How to handle if false?]
- Confidence impact: [Does this lower LCS? By how much?]

ASSUMPTION 2:
[Repeat for 5-8 total assumptions]

ADJUSTED LCS (If assumptions change):
- Original: 0.XX
- Adjusted: 0.YY
- Reason: [Why did it change?]
```

### 3.3 Logical Leap Verification

**Test each logical leap:**

```
LEAP 1: [Your logical conclusion]
- Leap: You're assuming [X] implies [Y]
- Verification needed: [How to test if true?]
- Test result: [What evidence supports/refutes?]
- Confidence after test: [0.XX]

LEAP 2:
[Repeat for 3-5 logical leaps]

EDGE CASES IDENTIFIED:
- Edge case 1: [Scenario] → [How to handle]
- Edge case 2: [Scenario] → [How to handle]
- Edge case 3: [Scenario] → [How to handle]
- [5+ total edge cases tested]
```

### 3.4 LCS Adjustments (Post-Audit)

```
UNIT: [Name]

LCS Before Audit: 0.XX
Audit Findings: [Assumption weakness, edge case, logical leap]
LCS After Audit: 0.YY
Change: [+/- 0.0Z]
Reason: [Specific weakness found and how to mitigate]

MITIGATION ADDED:
[Concrete fix to address the weakness]
```

---

## PHASE 4: SYNTHESIS & INTEGRATION

### 4.1 Integration Architecture

**Assemble atomic solutions in dependency order:**

```
COMPONENT 1 (Type validation):
[Solution sketch]
LCS: 0.XX
Dependencies: none

COMPONENT 2 (Data mapping):
[Solution sketch]
LCS: 0.XX
Dependencies: Component 1

COMPONENT 3 (UI composition):
[Solution sketch]
LCS: 0.XX
Dependencies: Component 1, 2

[Continue for all components]

INTEGRATION PATTERN:
[How do these components fit together?]
[Sequence: Component 1 → 2 → 3...]
[Interfaces: What does each pass to next?]
[Error handling: If Component 2 fails, what happens to 3?]
```

### 4.2 Global Confidence Score (GCS)

**Calculate using Lowest-Link Principle:**

```
LCS SCORES:
- Component 1: 0.98
- Component 2: 0.92
- Component 3: 0.88
- Component 4: 0.85
- Component 5: 0.78 ← WEAKEST LINK
- Component 6: 0.92

GCS = MIN(all LCS scores)
GCS = MIN(0.98, 0.92, 0.88, 0.85, 0.78, 0.92)
GCS = 0.78

INTERPRETATION:
This solution is only as strong as Component 5 (0.78).
All other components are more confident.
Component 5 is the bottleneck and must improve before approval.
```

### 4.3 Integration Checklist

**Verify 10+ integration criteria:**

```
☐ All LCS scores documented with reasoning
☐ GCS calculated using Lowest-Link Principle
☐ All edge cases from Phase 3 addressed
☐ Type safety verified (no 'any', strict TypeScript)
☐ RealEST design system applied (colors, typography, spacing)
☐ Nigerian market context validated (phone, currency, types)
☐ Accessibility requirements met (WCAG 2.1 AA)
☐ Mobile responsiveness considered (320px to 2560px)
☐ Dark mode support via useRealEstTheme()
☐ Error handling for all failure points
☐ Component composition follows HeroUI patterns
☐ Form patterns use React Hook Form + Zod
☐ Database changes honor RLS policies
☐ Prior similar patterns in codebase leveraged
☐ Performance implications assessed (rendering, queries, bundle size)

Checkboxes passing: [X]/15
Coverage: [XX]%
```

---

## PHASE 5: RECURSIVE REFLECTION

### 5.1 Threshold Check

```
Global Confidence Score: 0.XX
Threshold: 0.85
Status: [APPROVED / RE-EVALUATING / REJECTED]
```

### 5.2a: IF GCS ≥ 0.85 (APPROVED)

```
✓ APPROVAL GRANTED

All weaknesses identified and mitigated.
GCS meets threshold.
Proceeding to implementation phase.

OUTPUT: [See Phase 5 output format below]
```

### 5.2b: IF GCS < 0.85 (RE-EVALUATE)

```
⚠ RE-EVALUATION REQUIRED

GCS = 0.XX (below 0.85 threshold)

WEAK LINKS IDENTIFIED:
1. [Component X]: LCS 0.XX → [root cause]
2. [Component Y]: LCS 0.XX → [root cause]
3. [Component Z]: LCS 0.XX → [root cause]

RE-EVALUATION PASS (Single Pass Only):

FOR [Component X]:
  - Root cause: [specific issue]
  - Mitigation: [concrete fix]
  - New approach: [revised solution]
  - Re-scored LCS: 0.YY (was 0.XX)

FOR [Component Y]:
  - Root cause: [specific issue]
  - Mitigation: [concrete fix]
  - New approach: [revised solution]
  - Re-scored LCS: 0.YY (was 0.XX)

FOR [Component Z]:
  - Root cause: [specific issue]
  - Mitigation: [concrete fix]
  - New approach: [revised solution]
  - Re-scored LCS: 0.YY (was 0.XX)

RECALCULATED GCS:
GCS = MIN(0.98, 0.YY, 0.ZZ, 0.AA, 0.BB)
GCS = 0.ZZ

STATUS CHECK:
```

### 5.2c: IF GCS Still < 0.85 After Re-evaluation

```
✗ REJECTION - UNRESOLVABLE GAPS

GCS = 0.XX (remains below threshold after mitigation)

UNRESOLVABLE WEAK LINKS:
1. [Component X]: LCS 0.XX
   - Gap: [specific issue that can't be fixed without requirements change]
   - Constraint conflict: [What architectural constraint causes this?]
   
2. [Component Y]: LCS 0.XX
   - Gap: [specific issue]
   - Constraint conflict: [What requirement is in conflict?]

RECOMMENDATION:
Cannot proceed with current constraints.
Request user clarification on: [Specific gaps X, Y, Z]

DO NOT attempt further re-evaluation.
NO infinite loops. Stop here.
```

---

## 📋 PHASE 5 OUTPUT FORMAT

Output this exact structure when GCS is finalized:

```markdown
---
**[ANALYSIS COMPLETE]**

> **Core Problem:** [1-sentence problem statement]
> **Global Confidence Score (GCS):** [0.XX]
> **Status:** [APPROVED / REJECTED]

## Decomposition Summary
- Sub-domains identified: [N]
- Atomic units: [N]
- LCS range: [0.XX-0.YY]
- Weakest link: [Component name, LCS 0.XX]

## Phase Outputs
### Phase 1: Atomic Decomposition
- Scope: [True North]
- MECE Partitions: [5-10 sub-domains]
- Atomic Units: [20-50 units]
- Dependencies: [DAG execution order verified]

### Phase 2: Bayesian Execution
[LCS for each component, top 5 listed:]
- Component 1: 0.XX
- Component 2: 0.XX
- Component 3: 0.XX
- Component 4: 0.XX
- Component 5: 0.XX (weakest)

### Phase 3: Adversarial Audit
- Alternatives considered: 3
- Assumptions audited: 5+
- Edge cases tested: 5+
- LCS adjustments: [Description of changes]

### Phase 4: Synthesis
- Integration pattern: [Description]
- Component sequence: [Order]
- Error handling: [Strategy]

### Phase 5: Reflection
- GCS calculation: [MIN(0.XX, 0.XX, ...) = 0.XX]
- Threshold: 0.85
- Decision: [APPROVED / REJECTED]
[If re-evaluated: describe mitigation results]

## Key Decisions
1. [Decision with RealEST justification]
2. [Decision with design system alignment]
3. [Decision with architectural impact]

## Risks & Mitigations
| Risk | Mitigation | Confidence |
|------|-----------|------------|
| [Risk 1] | [How to handle] | 0.XX |
| [Risk 2] | [How to handle] | 0.XX |
| [Risk 3] | [How to handle] | 0.XX |

## Logic Path Summary
[2-3 sentence summary of: decomposed problem → solved units → audited assumptions → calculated confidence → made decision]

## Next Steps (If APPROVED)
1. [Specific implementation action]
2. [Specific testing action]
3. [Specific verification action]
4. [Specific commit action]

---
```

---

## ⚠️ ERROR HANDLING FOR ANALYSIS

**If you detect confusion:**
```
STOP
OUTPUT: "Cannot complete analysis: [specific gap]. 
         User, please clarify [X] before I continue."
REASON: Proceeding with ambiguity violates rigor principle
```

**If re-evaluation hits iteration limit:**
```
OUTPUT: "Re-evaluation limit reached. 
         GCS remains 0.XX. Status: REJECTED.
         Unresolvable gaps: [list].
         Clarify [X, Y, Z] before proceeding."
NO FURTHER LOOPS
```

**If contradictory constraints detected:**
```
OUTPUT: "Task has conflicting constraints:
         [Constraint A] requires [X]
         [Constraint B] forbids [X]
         Cannot satisfy both. Clarify before proceeding."
STOP ANALYSIS
```

---

## CORE PRINCIPLES FOR THIS PROMPT

1. **No Shortcutting:** All 5 phases executed fully. No skipping phases.
2. **Rigor Over Speed:** Deep reasoning. Take as many tokens needed.
3. **Explicit Confidence:** Every LCS justified, every GCS calculated.
4. **Single Audience:** Output to Agent system, not to humans.
5. **Threshold Matters:** GCS ≥ 0.85 required for approval.
6. **Error Handling:** Rejection > Uncertainty. Better to stop than guess.
7. **RealEST Context:** Every decision references project constraints.

---

**END OF ANALYSIS PROMPT**

---

*This prompt is loaded when: User requests deep analysis of a complex RealEST task.*  
*Return to CORE-SKILL.md after analysis to wait for next instruction.*
