# EXECUTION PROMPT - Implementation Phase

**TRIGGER:** When analysis is APPROVED (GCS ≥ 0.85) and user is ready to implement  
**SCOPE:** Implement solution following all verified constraints  
**INPUT:** Approved analysis document  
**OUTPUT:** Production-ready code + tests  

---

## 🚀 EXECUTION SETUP

You are operating in **EXECUTION MODE**. Your function is to implement the previously-analyzed solution following all constraints and mitigations from the analysis phase.

**Inputs (From Approved Analysis):**
- Phase 1: Decomposition (scope, constraints, dependencies)
- Phase 2: Solutions (LCS-scored components)
- Phase 3: Audited assumptions (edge cases, mitigations)
- Phase 4: Integration (component sequence, error handling)
- Phase 5: Risk table (specific risks + how to handle)
- GCS: ≥ 0.85 (approved)
- Next Steps: [Implementation actions]

**Outputs to produce:**
1. Production-ready code (fully typed, no 'any')
2. Unit tests (all edge cases from analysis)
3. Accessibility verification (WCAG 2.1 AA)
4. Mobile testing checklist (results)
5. Pre-commit verification (type check + lint)

---

## 📋 IMPLEMENTATION CONSTRAINTS

### Universal Constraints (All RealEST code)

```
✓ TypeScript Strict Mode
  - No 'any' type, ever
  - Explicit types on all function parameters
  - Explicit return types
  - No @ts-ignore comments

✓ Component Library (Priority Order)
  1. HeroUI v3 from @heroui/react (preferred)
  2. UntitledUI (status, indicators only)
  3. Custom Tailwind CSS (when both lack primitive)
  Result: ~70% HeroUI naturally

✓ Design System
  - Colors from styles/tokens/colors.css (CSS variables)
  - Typography: 4-tier (Lufga, Neulis Neue, Space Grotesk, JetBrains Mono)
  - Spacing: 4px units via Tailwind
  - 60-30-10 rule: 60% dark, 30% neutral, 10% accent (green only for CTAs)

✓ Nigerian Market Context
  - Phone validation: +234\d{10}
  - Currency: Naira with comma formatting (₦)
  - Location: State/LGA cascading selects
  - Infrastructure: NEPA, water, security as property attributes
  - Property types: BQ, self-contained, face-me-I-face-you

✓ Type System (Single Source of Truth)
  - users.role: Source of truth (enum: user|owner|agent|admin)
  - profiles: User metadata ONLY (no role column)
  - Property: Full interface from lib/supabase/types.ts
  - RLS policies: Enforced per role

✓ Form Patterns
  - State management: React Hook Form
  - Validation: Zod schemas
  - Components: HeroUI Input, Select, Textarea
  - Real-time validation feedback
  - Nigerian phone format validation (+234)

✓ Accessibility (WCAG 2.1 AA Minimum)
  - Semantic HTML (use <button>, not <div role="button">)
  - ARIA labels where needed (aria-label, aria-describedby)
  - Color contrast ratio ≥ 4.5:1 for text
  - Keyboard navigation (Tab, Enter, Escape)
  - Focus indicators (visible outline)
  - Form validation messages (error attributes)

✓ Responsive Design (Mobile-First)
  - Base styles: 320px width (mobile)
  - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
  - Use Tailwind prefixes: sm:, md:, lg:, xl:
  - Test on: 320px, 375px, 768px, 1024px

✓ Dark Mode Support
  - Use useRealEstTheme() hook for theme-aware styling
  - All colors tested in both light + dark
  - Verify contrast ratios in dark mode
```

---

## 💻 IMPLEMENTATION FLOW

### Step 1: Extract Constraints from Analysis

```
FROM ANALYSIS, extract:
- Scope: [True North + Out-of-Scope]
- Constraints: [Performance, security, localization, etc.]
- Integration architecture: [Component sequence]
- Risk + Mitigation table: [Specific handling]
- Edge cases: [5+ scenarios from Phase 3]
```

### Step 2: Implement Components (In Dependency Order)

**For each atomic unit from Phase 4:**

```
UNIT: [Name]
Dependencies: [What must exist first?]
LCS: [Score from analysis]
Risk: [From risk table]
Mitigation: [How to handle risk]

IMPLEMENTATION:
[Code with full types and comments]

VERIFICATION:
- ☐ TypeScript strict mode passes
- ☐ All parameters explicitly typed
- ☐ Return type explicit
- ☐ Error handling implemented
- ☐ Edge cases from analysis covered
- ☐ RealEST patterns followed
- ☐ Accessibility attribute present (if UI)
- ☐ Mobile responsive (if UI)
- ☐ Dark mode tested (if UI)
```

### Step 3: Write Unit Tests

**For each edge case from Phase 3:**

```
EDGE CASE: [Scenario from analysis]
Expected Behavior: [How should component handle it?]
Test: [Test code]

TEST COVERAGE:
- ☐ Happy path (normal case)
- ☐ Edge case 1: [Scenario]
- ☐ Edge case 2: [Scenario]
- ☐ Edge case 3: [Scenario]
- ☐ Error case: [Failure handling]
```

### Step 4: Accessibility Audit

```
Component/Page: [Name]

WCAG 2.1 AA Checklist:
☐ Semantic HTML used (no <div role="button">)
☐ ARIA labels present (aria-label or aria-describedby)
☐ Color contrast ≥ 4.5:1 (text)
☐ Focus indicator visible (outline or custom)
☐ Keyboard navigation works (Tab, Enter, Escape)
☐ Form error messages linked to inputs
☐ Images have alt text (or alt="")
☐ No flickering (seizure risk)
☐ Tested with: Keyboard only, aXe DevTools

Result: ☐ PASS / ☐ FAIL (if fail, fix before commit)
```

### Step 5: Mobile Responsiveness Testing

```
Component/Page: [Name]

TESTED VIEWPORTS:
- 320px (mobile)
  ☐ Readable text (no squishing)
  ☐ Buttons tap-friendly (44px minimum)
  ☐ Images scale appropriately
  ☐ Form inputs accessible
  
- 375px (iPhone)
  ☐ Layout reflow correct
  ☐ Typography stacking proper
  ☐ No horizontal scroll
  
- 768px (tablet)
  ☐ 2-column layout if applicable
  ☐ Touch targets sized correctly
  
- 1024px+ (desktop)
  ☐ Multi-column layout
  ☐ Hover states functional
  ☐ Max-width constraints

Result: ☐ PASS / ☐ FAIL (if fail, fix before commit)
```

### Step 6: Dark Mode Testing

```
Component/Page: [Name]
useRealEstTheme() integrated: ☐ YES / ☐ NO

DARK MODE VERIFICATION:
- ☐ Background color uses CSS variable
- ☐ Text color has sufficient contrast in dark
- ☐ Component tested with theme: dark
- ☐ No hardcoded hex colors (#xxx)
- ☐ Color transition smooth
- ☐ Icons visible in both modes
- ☐ Form inputs readable in dark

Result: ☐ PASS / ☐ FAIL (if fail, fix before commit)
```

### Step 7: Pre-Commit Quality Gate

**Execute in terminal:**

```bash
# Type Checking (MUST BE 0 errors)
npx tsc --noEmit
→ Expected: "✓ No errors"

# Linting (MUST BE 0 errors)
npm run lint
→ Expected: "✓ No lint errors"

# If either fails:
→ FIX THE ISSUES
→ Do NOT proceed to commit
```

### Step 8: User Consent & Commit

```
If all checks pass:
→ OUTPUT: "I've implemented [feature]. 
           Type checking and linting passed with zero errors. 
           May I commit these changes with the message: [conventional-commit]?"

Wait for user confirmation

If user approves:
→ git add [files]
→ git commit -m "[type(scope): subject]"
→ CONFIRM COMMIT to user

Conventional format:
  feat(property-detail): Add inquiry form with validation
  fix(auth): Correct role checking on users table
  refactor(component-library): Simplify PropertyCard composition
  test(form-patterns): Add edge case tests for Nigerian phone
```

---

## 🎯 IMPLEMENTATION CHECKLIST (Per Component)

```
Component: [Name]
From Analysis Phase: [Reference to unit from Phase 4]

IMPLEMENTATION COMPLETENESS:
☐ Source code written (all functions)
☐ Type annotations complete (no 'any')
☐ Return types explicit
☐ Error handling for all failure points
☐ RealEST patterns applied (HeroUI, colors, types)
☐ Edge cases handled (5+ from Phase 3)
☐ Comments added (complex logic explained)

TESTING:
☐ Unit tests written (happy path + edge cases)
☐ All tests passing locally
☐ Edge case tests cover Phase 3 audit results
☐ Error states tested

ACCESSIBILITY (UI Components Only):
☐ Semantic HTML
☐ ARIA labels present
☐ Keyboard navigation works
☐ Color contrast verified
☐ Focus indicators visible
☐ aXe DevTools run (no violations)

RESPONSIVE DESIGN (UI Components Only):
☐ Mobile (320px) tested
☐ Tablet (768px) tested
☐ Desktop (1024px+) tested
☐ Touch targets ≥ 44px
☐ No horizontal scroll

DARK MODE (All Components):
☐ useRealEstTheme() applied
☐ Colors use CSS variables
☐ Tested in dark mode
☐ Contrast verified
☐ No hardcoded colors

QUALITY GATES:
☐ npx tsc --noEmit → 0 errors
☐ npm run lint → 0 errors
☐ All tests passing
☐ Accessibility audit passed
☐ Mobile responsiveness verified

COMMIT READINESS:
☐ Code review checklist complete
☐ conventional commit message prepared
☐ User consent obtained
☐ Ready to push
```

---

## 📌 IMPLEMENTATION REFERENCE

### HeroUI v3 Pattern Examples

**Input Component:**
```typescript
import { Input } from '@heroui/react'

export function PhoneInput() {
  return (
    <Input
      type="tel"
      label="Phone"
      placeholder="+234"
      pattern="^\+234\d{10}$"
      errorMessage="Must be +234XXXXXXXXXX format"
      isRequired
    />
  )
}
```

**Form with Zod:**
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'

const schema = z.object({
  phone: z.string().regex(/^\+234\d{10}$/, 'Invalid Nigerian phone')
})

export function InquiryForm() {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema)
  })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('phone')} />
      {formState.errors.phone && <span>{formState.errors.phone.message}</span>}
    </form>
  )
}
```

**Color Token Usage:**
```typescript
// ❌ AVOID:
<div style={{ backgroundColor: '#07402F' }} />

// ✅ PREFER:
<div className="bg-primary text-foreground" />
// OR
<div style={{ backgroundColor: 'var(--primary)' }} />
```

**Responsive Design:**
```typescript
export function Card() {
  return (
    <div className="
      grid grid-cols-1 gap-4    /* Mobile */
      sm:grid-cols-2            /* Tablet */
      md:grid-cols-3            /* Desktop */
      lg:grid-cols-4            /* Large desktop */
    ">
      {/* Content */}
    </div>
  )
}
```

**Dark Mode Support:**
```typescript
import { useRealEstTheme } from '@/components/providers/realest-theme-provider'

export function Component() {
  const { theme } = useRealEstTheme()
  
  return (
    <div className="
      bg-background text-foreground    /* Respects theme */
      dark:bg-slate-950              /* Dark mode override if needed */
    ">
      {/* Content automatically adapts */}
    </div>
  )
}
```

---

## ⚠️ IMPLEMENTATION ERROR HANDLING

**If Type Checking Fails:**
```
1. Read error: "Property 'X' does not exist on type 'Y'"
2. Fix: Add proper type definition or assert type
3. Re-run: npx tsc --noEmit
4. Verify: 0 errors before proceeding
```

**If Linting Fails:**
```
1. Read error: "unused variable X"
2. Fix: Remove unused code or use variable
3. Re-run: npm run lint
4. Verify: 0 errors before proceeding
```

**If Accessibility Audit Fails:**
```
1. Run: aXe DevTools in browser
2. Fix: Add missing ARIA labels or semantic HTML
3. Re-test: Run aXe again
4. Verify: No violations before committing
```

**If Mobile Testing Fails:**
```
1. Viewport: Test at failing resolution
2. Issue: [Identify layout/interaction problem]
3. Fix: Adjust Tailwind breakpoints or CSS
4. Verify: Works on all test resolutions
```

---

## ✅ SUCCESS CRITERIA (Implementation Complete)

```
Code Quality:
✓ All components fully typed (no 'any')
✓ TypeScript: npx tsc --noEmit returns 0 errors
✓ Linting: npm run lint returns 0 errors
✓ Error handling for all edge cases from analysis

Testing:
✓ Unit tests written for happy path
✓ Unit tests for all edge cases (Phase 3)
✓ Unit tests for error scenarios
✓ All tests passing locally

Accessibility:
✓ WCAG 2.1 AA compliant
✓ aXe DevTools: 0 violations
✓ Keyboard navigation: Fully functional
✓ Color contrast: ≥ 4.5:1

Responsive:
✓ Mobile (320px): Tested and working
✓ Tablet (768px): Tested and working
✓ Desktop (1024px+): Tested and working
✓ Touch targets: ≥ 44px

Dark Mode:
✓ Colors use CSS variables
✓ Tested in both light + dark
✓ Contrast verified
✓ No hardcoded colors

RealEST Compliance:
✓ Design system applied (colors, typography)
✓ Nigerian market context (phone, currency, types)
✓ HeroUI components used (70% naturally)
✓ Form patterns (React Hook Form + Zod)
✓ Type system (users.role, RLS policies)

Ready to Commit:
✓ All quality gates passed
✓ Conventional commit message prepared
✓ User consent obtained
✓ Code ready for git push
```

---

## 📝 OUTPUT WHEN IMPLEMENTATION COMPLETE

```
✅ IMPLEMENTATION COMPLETE

Component(s): [List]
Files modified: [Count]
Tests added: [Count]
Accessibility: WCAG 2.1 AA ✓
Mobile tested: ✓
Dark mode: ✓

Pre-commit verification:
- Type checking: ✓ 0 errors
- Linting: ✓ 0 errors
- Tests: ✓ All passing

Commit message:
[conventional-commit-format]

Ready to commit: YES

[Ask for user consent to commit]
```

---

**END OF EXECUTION PROMPT**

---

*This prompt is loaded when: Analysis is APPROVED (GCS ≥ 0.85) and user requests implementation.*  
*Return to CORE-SKILL.md after implementation to wait for next instruction.*
