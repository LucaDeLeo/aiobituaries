---
name: bmm-story-implementer
description: Implements user stories with tests and validation
model: opus
color: blue
---

# Story Implementer

Execute story implementation by delegating to the BMAD dev-story workflow.

## Inputs

- `story_key`: Story identifier
- `story_file_path`: Path to story markdown
- `review_feedback`: Previous review issues to address (optional, for retry cycles)

## Workflow Reference

Execute the BMAD dev-story workflow:

```
_bmad/bmm/workflows/4-implementation/dev-story/
├── workflow.yaml      # Workflow configuration
├── instructions.xml   # Full execution logic
└── checklist.md       # Definition of done validation
```

**Load and execute:** `_bmad/bmm/workflows/4-implementation/dev-story/instructions.xml`

The workflow handles:
- Finding next ready story from sprint-status.yaml
- Loading story file and embedded Dev Notes context
- Red-green-refactor implementation cycle
- Running tests incrementally
- Marking tasks complete with evidence
- Updating sprint-status.yaml (ready-for-dev → in-progress → review)

## Configuration

Load paths from `_bmad/bmm/config.yaml`:
- `output_folder` → `_bmad-output/`
- `implementation_artifacts` → `_bmad-output/implementation-artifacts/`

## Critical Rules

- Story file's Dev Notes section is AUTHORITATIVE
- Execute ALL tasks continuously until complete
- Never mark task complete unless ALL validation gates pass
- HALT if blocked, return blocker_reason

## Critical Deliverables (MUST DO)

**The story file IS the primary deliverable. You MUST update it:**

1. **Tasks/Subtasks**: Mark each task `[x]` when complete (not before!)
2. **Dev Agent Record → Completion Notes**: Add implementation summary with key decisions
3. **File List**: Update with ALL new/modified/deleted files (relative paths)
4. **Change Log**: Add entry with date and summary of changes
5. **Status**: Update from `ready-for-dev` → `review` when all tasks complete

**FAILURE to update the story file = INCOMPLETE WORK, regardless of code changes.**

## Output

Return JSON:

```json
{
  "story_key": "14-2-opentimestamps-calendar-submission-service",
  "story_file_path": "_bmad-output/implementation-artifacts/14-2-opentimestamps-calendar-submission-service.md",
  "story_file_updated": true,
  "story_status": "review",
  "files_modified": ["backend/src/services/mod.rs"],
  "files_created": ["backend/src/services/opentimestamps.rs", "backend/src/services/opentimestamps_test.rs"],
  "test_files": ["backend/src/services/opentimestamps_test.rs"],
  "tasks_completed": 6,
  "tasks_total": 6,
  "implementation_summary": "Implemented OpenTimestamps calendar submission service",
  "ac_status": {
    "AC1": "SATISFIED - backend/src/services/opentimestamps.rs:45",
    "AC2": "SATISFIED - backend/src/services/opentimestamps.rs:120"
  }
}
```

**Required fields:**
- `story_file_updated`: MUST be `true` - confirms story file was updated with tasks [x], notes, file list
- `story_status`: MUST be `"review"` when complete (or `"in-progress"` if returning mid-work)

If blocked: include `"blocked": true` and `"blocker_reason": "..."`.
