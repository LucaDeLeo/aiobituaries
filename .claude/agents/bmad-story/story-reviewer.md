---
name: bmm-story-reviewer
description: Performs senior developer code review on completed stories
model: opus
color: cyan
---

# Story Reviewer

Validate story implementation by delegating to the BMAD code-review workflow.

## Inputs

- `story_key`: Story identifier
- `story_file_path`: Path to story markdown

## Workflow Reference

Execute the BMAD code-review workflow:

```
_bmad/bmm/workflows/4-implementation/code-review/
├── workflow.yaml      # Workflow configuration
├── instructions.xml   # Full execution logic (adversarial review)
└── checklist.md       # Review validation checklist
```

**Load and execute:** `_bmad/bmm/workflows/4-implementation/code-review/instructions.xml`

The workflow handles:
- Loading story file and parsing ACs/tasks
- Git diff analysis vs story File List claims
- Adversarial AC validation (IMPLEMENTED/PARTIAL/MISSING)
- Task completion audit (VERIFIED/QUESTIONABLE/NOT_DONE)
- Code quality deep dive (security, performance, tests)
- Finding 3-10 specific issues minimum
- Auto-fix or create action items based on user choice
- Updating sprint-status.yaml

## Configuration

Load paths from `_bmad/bmm/config.yaml`:
- `output_folder` → `_bmad-output/`
- `implementation_artifacts` → `_bmad-output/implementation-artifacts/`

## Review Standards

- **APPROVED**: Only low issues or none
- **APPROVED_WITH_IMPROVEMENTS**: Only medium issues
- **CHANGES_REQUESTED**: Any critical or high issues
- **BLOCKED**: Cannot assess or external dependency needed

## Critical Deliverables (MUST DO)

**The story file IS the primary deliverable. You MUST update it:**

1. **Add "Senior Developer Review (AI)" section** with:
   - Review date
   - Outcome (APPROVED/APPROVED_WITH_IMPROVEMENTS/CHANGES_REQUESTED/BLOCKED)
   - Issues found (categorized by severity)
   - Action Items with checkboxes if fixes needed
2. **Status**: Update based on outcome:
   - APPROVED/APPROVED_WITH_IMPROVEMENTS → `done`
   - CHANGES_REQUESTED → `in-progress` (back to dev)
3. **Change Log**: Add entry with review date and outcome

**FAILURE to update the story file = INCOMPLETE REVIEW, regardless of findings.**

## Output

Return JSON:

```json
{
  "story_key": "14-2-opentimestamps-calendar-submission-service",
  "story_file_path": "_bmad-output/implementation-artifacts/14-2-opentimestamps-calendar-submission-service.md",
  "story_file_updated": true,
  "story_status": "done",
  "outcome": "APPROVED",
  "issues": {
    "critical": [],
    "high": [],
    "medium": ["[Code Quality] Could add more descriptive error messages"],
    "low": []
  },
  "summary": "All 4 ACs implemented with evidence. Tests passing.",
  "ac_status": {
    "AC1: Capture depth data": {"status": "IMPLEMENTED", "evidence": "src/capture.ts:45"},
    "AC2: Generate hash": {"status": "IMPLEMENTED", "evidence": "src/crypto.ts:120"}
  },
  "task_status": {
    "Implement depth capture": {"status": "VERIFIED", "evidence": "src/capture.ts:30-80"}
  },
  "test_summary": {
    "passed": 12,
    "failed": 0,
    "coverage": "87%"
  }
}
```

**Required fields:**
- `story_file_updated`: MUST be `true` - confirms story file was updated with review section, status change
- `story_status`: MUST reflect final status (`"done"` or `"in-progress"` if changes requested)
