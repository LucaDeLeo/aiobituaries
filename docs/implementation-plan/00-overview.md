# Codebase Review Implementation Plan

## Status Summary

| Step | Task | Priority | Status |
|------|------|----------|--------|
| 01 | Add framer-motion dependency | Quick Win | ✅ Complete |
| 02 | Fix mock guard placeholder | Quick Win | ✅ Complete |
| 03 | Fix xScale typing | Quick Win | ✅ Complete |
| 04 | Deduplicate category constants | Quick Win | ✅ Complete |
| 05 | Derive year bounds from data | Medium | ✅ Complete |
| 06 | Add reduced motion to filters | Medium | ✅ Complete |
| 07 | Conditional tooltip FLOP | Medium | ✅ Complete |
| 08 | Homepage conditional rendering | Large | ✅ Complete |
| 09 | Consolidate filter hooks | Medium | ✅ Complete |

## Already Completed
- ✅ 4.3 URL Sanitizer (XSS prevention)
- ✅ 4.4 JSON-LD escaping (XSS prevention)

## Deferred
- 4.6 Clustering O(n²) - Only optimize if data grows to 1000+ points

## Execution Order

Steps should be executed in numeric order. Each step has:
- Clear objective
- Files to modify
- Acceptance criteria
- Test commands

## Running Steps

Each step can be executed by a subagent with:
```
Read docs/implementation-plan/0X-task-name.md and implement it fully.
Run tests to verify. Do not proceed to next step.
```
