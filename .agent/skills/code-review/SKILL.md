---
name: code-review
description: Reviews code changes for bugs, style issues, and best practices. Use when reviewing PRs, checking code quality, or validating changes before commit.
---

# Code Review Skill

When reviewing code changes, follow this systematic approach to ensure quality and consistency.

## Review Checklist

### 1. Correctness

- Does the code do what it's supposed to do?
- Are edge cases handled (null, empty, boundary values)?
- Are error conditions properly caught and handled?
- Is the logic correct and complete?

### 2. Type Safety

- Are types properly defined (no `any` or `unknown` without justification)?
- Are nullable values handled with proper checks?
- Do function signatures match their implementations?

### 3. Architecture Compliance

Verify changes follow project patterns:

| Layer | Expected Pattern |
|:------|:-----------------|
| Data Layer | Pure DB queries, no business logic |
| Service Layer | Business logic, caching, typed context (`DbContext`, `AuthContext`) |
| API Layer | `createServerFn()` with middleware chains |

### 4. Security

- Are user inputs validated (Zod schemas)?
- Is authentication/authorization properly enforced?
- Are sensitive data properly protected?
- No hardcoded secrets or credentials?

### 5. Performance

- Are there obvious inefficiencies (N+1 queries, unnecessary re-renders)?
- Is caching used appropriately?
- Are background tasks delegated to `waitUntil` when appropriate?

### 6. Code Style

- Follows naming conventions (camelCase, PascalCase, kebab-case files)?
- Server Functions end with `Fn` suffix?
- Proper use of semantic color variables for styling?

## Review Process

### Step 1: Understand Context

```bash
# View recent commits
git log -5 --oneline

# View staged changes
git diff --cached

# View unstaged changes
git diff
```

### Step 2: Identify Changed Files

Categorize by type:
- **Backend** (`.service.ts`, `.api.ts`, `.data.ts`)
- **Frontend** (`.tsx` in routes/components)
- **Config** (`.config.ts`, `wrangler.jsonc`)
- **Tests** (`.test.ts`)

### Step 3: Review Each Change

For each file, check:
1. **What changed?** (additions, deletions, modifications)
2. **Why?** (bug fix, feature, refactor)
3. **Is it correct?** (logic, types, patterns)
4. **Any concerns?** (breaking changes, missing tests)

### Step 4: Validate

```bash
# Type check
bun tsc --noEmit

# Lint and format
bun check

# Run tests if applicable
bun run test
```

## Providing Feedback

### Format

Structure feedback as:

```markdown
## Summary
Brief overview of changes and overall assessment.

## Issues Found
- 🔴 **Critical**: Must fix before merge
- 🟡 **Warning**: Should fix, but not blocking
- 🔵 **Suggestion**: Nice to have improvements

## Specific Comments
File-by-file or section-by-section feedback with code references.

## Questions
Any clarifications needed from the author.
```

### Tone Guidelines

- Be specific about what needs to change
- Explain **why**, not just **what**
- Suggest alternatives when possible
- Acknowledge good patterns and improvements
- Use questions for subjective preferences

## Common Issues to Watch For

### Backend

| Issue | Example | Fix |
|:------|:--------|:----|
| Wrong context type | `context: any` | Use `DbContext`, `AuthContext`, etc. |
| Missing cache invalidation | Update without `bumpVersion()` | Add cache invalidation |
| Workflow not triggered | Direct DB update on publish | Call workflow via binding |

### Frontend

| Issue | Example | Fix |
|:------|:--------|:----|
| Missing loading state | No `pendingComponent` | Add skeleton component |
| Stale query data | Missing `queryKey` invalidation | Call `queryClient.invalidateQueries()` |
| Hardcoded colors | `text-gray-500` | Use `text-muted-foreground` |

### Tests

| Issue | Example | Fix |
|:------|:--------|:----|
| Missing await | `await seedUser()` not awaited | Add `await` |
| No background task wait | Assert immediately after async op | Use `waitForBackgroundTasks()` |
| Using `any` | `as any` cast | Update test-utils or use proper types |
