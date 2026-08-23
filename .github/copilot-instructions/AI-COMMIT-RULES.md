# AI Agent Commit Rules & Guidelines

## ⚠️ CRITICAL PRE-COMMIT WORKFLOW

**NEVER commit code without completing ALL steps below:**

### 1. Fix All Errors COMPLETELY
- Verify the fix addresses the root cause, not just symptoms
- Test the fix in context (don't assume it works)
- Use `get_errors` tool to verify zero errors in modified files

### 2. Run Type Checking
```bash
npx tsc --noEmit
```
**Requirement**: ZERO TypeScript errors before proceeding

### 3. Run Linting
```bash
npm run lint
```
**Requirement**: ZERO lint errors before proceeding

### 4. Ask for User Consent
**MANDATORY**: Always ask user permission before committing:
```
"I've fixed the errors in [file]. Type checking and linting passed with zero errors. 
May I commit these changes with the message: [commit message]?"
```

### 5. Only Then Commit
After explicit user approval:
```bash
git add [files]
git commit -m "[conventional commit message]"
```

---

## Pre-Commit Checklist

Before ANY commit, verify:

- [ ] All errors in modified files are fixed (use `get_errors`)
- [ ] `npx tsc --noEmit` returns 0 errors
- [ ] `npm run lint` returns 0 errors  
- [ ] User has explicitly approved the commit
- [ ] Commit message follows conventional commits format

---

## Conventional Commit Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `style`: Formatting, missing semicolons, etc.
- `docs`: Documentation only
- `test`: Adding/updating tests
- `chore`: Build process, dependencies, tooling

### Examples
```bash
fix(user-dashboard): correct HeroUI Chip component usage

- Changed Chip to use icons as children, not startContent
- Updated variant from "flat" to "secondary"
- Maintains 70% HeroUI branding consistency

Closes #123
```

---

## Error Handling Protocol

### When Errors Are Detected

1. **Stop immediately** - Do not proceed with partial fixes
2. **Analyze the error** - Read the full error message and stack trace
3. **Identify root cause** - Don't just fix symptoms
4. **Check similar code** - Use `grep_search` to find patterns in working code
5. **Apply fix** - Make targeted changes
6. **Verify fix** - Use `get_errors` to confirm
7. **Test related code** - Ensure fix doesn't break other functionality

### When to Revert

If you realize after committing that:
- The fix was incomplete
- Type checking would have failed
- User consent was not obtained

**Immediately revert**:
```bash
git reset --soft HEAD~1
```

Then follow the proper workflow.

---

## HeroUI v3 Specific Rules (70% Strategy)

### Component Import Consistency

✅ **Correct (HeroUI):**
```typescript
import { Card, Button, Chip } from "@heroui/react"

// HeroUI supports compound patterns:
<Card.Root>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content</Card.Content>
</Card.Root>

// Chip with icons as children:
<Chip variant="secondary">
  <Icon className="w-4 h-4" />
  Text
</Chip>
```

❌ **Incorrect:**
```typescript
// Don't mix libraries unnecessarily
import { Card } from "@/components/ui/card"  // Shadcn
import { Button } from "@heroui/react"        // Mixed

// Don't use unsupported props
<Chip startContent={<Icon />}>Text</Chip>  // startContent doesn't exist
<Chip color="secondary">Text</Chip>        // "secondary" is not a valid color
<Chip variant="flat">Text</Chip>           // "flat" is not a valid variant
```

### Valid HeroUI Chip Props
- **color**: "default" | "success" | "warning" | "danger" | "accent"
- **variant**: "primary" | "secondary" | "tertiary" | "soft"

---

## Database Access Rule (MANDATORY)

- Supabase is ONLY to be used for authentication (auth flows, user session, JWT validation, etc).
- All other database queries (API routes, server code, data fetching, mutations, etc.) MUST use Prisma.
- Never use Supabase for DB reads/writes except in the authentication layer.
- This rule applies to all new and existing code. Refactor any legacy code that violates this rule.

---

## Testing Before Commit

### Minimal Test Suite
```bash
# 1. Type check
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Build test (optional but recommended)
npm run build
```

### When to Skip Build Test
- Minor text/comment changes
- Documentation updates
- CSS-only changes

**Still required**: Type check + Lint

---

## User Communication Protocol

### When Asking for Consent

**Good**:
```
✅ Fixed the HeroUI Chip errors in ComingSoonHero.tsx
✅ Type checking passed (0 errors)
✅ Linting passed (0 errors)

Changes:
- Replaced startContent prop with icon as child element
- Changed color="secondary" to variant="secondary"
- Added flex gap-2 for proper icon spacing

May I commit these changes?
```

**Bad**:
```
Fixed it! Committing now...
```

### When Errors Persist

**Be transparent**:
```
I attempted to fix the error, but type checking still shows:
[error details]

I need to investigate further. Would you like me to:
1. Try a different approach
2. Research the HeroUI API documentation
3. Look at similar working code in the codebase
```

---

## Emergency Protocols

### If You Accidentally Committed Without Verification

1. **Immediately inform user**:
   ```
   ⚠️ I apologize - I committed without running type checking and linting.
   Let me revert and fix this properly.
   ```

2. **Revert the commit**:
   ```bash
   git reset --soft HEAD~1
   ```

3. **Follow the proper workflow**

### If User Reports Issues After Your Commit

1. **Acknowledge immediately**
2. **Investigate the issue** (use `get_errors`, `grep_search`)
3. **Provide analysis** before attempting fix
4. **Ask permission** to proceed with fix

---

## Summary: The Golden Rule

**NEVER COMMIT WITHOUT:**
1. ✅ Zero errors in `get_errors`
2. ✅ Zero errors in `npx tsc --noEmit`
3. ✅ Zero errors in `npm run lint`
4. ✅ Explicit user approval

**NO EXCEPTIONS.**

---

## Implementation Date
December 18, 2025

## Rationale
This workflow ensures code quality, prevents broken commits, respects user control, and maintains RealEST project standards.
