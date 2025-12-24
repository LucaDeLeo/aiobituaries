# Quality Criteria for AI Obituaries

Editorial guidelines defining what belongs in the archive.

## Purpose

AI Obituaries documents predictions that AI will fail, is overhyped, or has fundamental limitations. The archive serves as a historical record of AI skepticism, providing context for evaluating how claims have aged against actual AI progress.

**This is NOT:**
- A collection of reasonable caution about AI deployment
- AI safety/risk warnings (those are the opposite thesis)
- General tech commentary without specific falsifiable claims

## Inclusion Criteria (Hard Requirements)

A claim **must** meet ALL of the following to be included:

### 1. Falsifiable AI Skepticism
The claim must make a testable prediction about AI's limitations or failure:
- "AI will never X" (capability claim)
- "AI can't truly X" (understanding/reasoning claim)
- "AI bubble will burst by X" (market claim)
- "AGI won't happen for X years/ever" (timeline claim)

**Fails this gate:**
- "We should be careful about AI" (reasonable caution, not a prediction)
- "AI poses existential risk" (opposite thesis - AI worry, not AI dismissal)
- "I'm skeptical of AI" (vague sentiment, no specific claim)

### 2. Attributable Source
The claim must have:
- Clear author/publication attribution
- Original source URL
- Verifiable publication date

**Fails this gate:**
- Anonymous posts
- Unverifiable screenshots
- Claims without dates

### 3. Notability Threshold
The source must be notable enough to track:
- Domain expert (AI researcher, tech executive, industry analyst)
- Major publication (tier 1/2 journalism outlets)
- Viral reach (10k+ followers for social media)
- Historical significance (early predictions that proved wrong)

**Fails this gate:**
- Random social media users
- No-name blogs
- Comment sections

### 4. Not Already Archived
Prevent duplicates by checking:
- Same claim from same source within 30 days
- Substantially similar wording
- Same prediction, just repeated

## Quality Scoring Rubric (0-100)

Each claim is scored across 4 dimensions, 25 points max each:

### Falsifiability (0-25 pts)

How testable is the prediction?

| Score | Criteria | Example |
|-------|----------|---------|
| 25 | Specific timeline + capability | "AI won't write production code by 2025" |
| 20 | Specific capability ("will never") | "LLMs will never understand context" |
| 15 | General timeline | "AGI is decades away" |
| 10 | Vague but testable | "AI can't do creative work" |
| 5 | Nearly unfalsifiable | "AI isn't real intelligence" |

### Source Authority (0-25 pts)

How credible is the source?

| Score | Criteria | Example |
|-------|----------|---------|
| 25 | Domain expert + tier 1 publication | Gary Marcus in NYT |
| 20 | Adjacent expert or tech journalist | Senior tech reporter |
| 15 | Notable (10k+ followers) | Verified tech personality |
| 10 | Tier 2 publication | Tech blog author |
| 5 | Minor source | Small publication |

### Claim Boldness (0-25 pts)

How confident is the prediction?

| Score | Criteria | Example |
|-------|----------|---------|
| 25 | Absolute certainty | "AI will NEVER..." |
| 20 | Strong conviction | "I'm confident AI won't..." |
| 15 | Moderate conviction | "I don't think AI will..." |
| 10 | Hedged | "AI probably won't..." |
| 5 | Mild | "I doubt AI will..." |

### Historical Value (0-25 pts)

How significant is this claim?

| Score | Criteria | Example |
|-------|----------|---------|
| 25 | Widely cited/influential | Claim that shaped discourse |
| 20 | Viral reach | 1M+ impressions |
| 15 | Notable person | Expert making specific claim |
| 10 | Relevant expert | Insider perspective |
| 5 | Historical artifact | Worth preserving |

### Thresholds

- **Score >= 50**: Auto-approve for publication
- **Score 35-49**: Queue for human review
- **Score < 35**: Auto-reject

## Category Definitions

### capability-narrow
**Task Skepticism** - Claims AI cannot perform specific tasks

Examples:
- "AI will never write production-quality code"
- "Self-driving cars are 10 years away" (perennial)
- "AI can't do real creative work"
- "LLMs can't do math"

### capability-reasoning
**Intelligence Skepticism** - Claims about AI's reasoning/understanding

Examples:
- "LLMs are just stochastic parrots"
- "AI doesn't actually understand anything"
- "It's just pattern matching, not intelligence"
- "AI can't truly reason"

### market
**Market/Bubble Claims** - Financial/business skepticism

Examples:
- "AI bubble will burst by 2025"
- "AI is massively overvalued"
- "AI investment is the next dot-com crash"
- "Nvidia's valuation is unsustainable"

### agi
**AGI Skepticism** - Claims about AGI specifically

Examples:
- "AGI is impossible"
- "We won't have AGI for 100 years"
- "AGI is a myth"
- "Current approaches will never lead to AGI"

### dismissive
**General Dismissal** - Broad AI skepticism without specific claims

Examples:
- "AI is just hype"
- "This AI stuff is ridiculous"
- "People are overreacting to AI"
- "AI is a fad"

## Anti-Patterns (Exclusions)

**DO NOT include claims that are:**

### 1. Reasonable Caution
Thoughtful concerns about AI deployment, not predictions of failure.

Bad: "We should be careful about deploying AI in healthcare"
Good: "AI will never be safe enough for healthcare" (falsifiable)

### 2. Risk Warnings (Opposite Thesis)
AI safety concerns are the *opposite* of AI doom - they worry AI will be *too* capable.

Bad: "AI poses existential risk to humanity"
Bad: "We need to slow down AI development"
(These acknowledge AI's power, not its limitations)

### 3. Out-of-Context Quotes
Snippets that misrepresent the author's actual view.

Bad: Tweet cherry-picking one sentence from a nuanced article
Good: Full quote with proper context

### 4. Satire/Jokes
Obviously humorous takes, even from notable sources.

Bad: "AI will destroy us all (lol jk)"
Bad: Ironic/sarcastic posts

### 5. Self-Serving Claims
Competitors trashing each other for business reasons.

Bad: Google exec saying OpenAI is overhyped
Bad: Startup founder dismissing competitor's AI claims

### 6. Vague Sentiments
Statements without specific predictions.

Bad: "I'm skeptical of AI"
Bad: "AI has limitations"
Good: "AI can't X" (specific limitation claim)

## Claim Status Tracking

Each claim has a status:

- **pending**: Claim cannot yet be evaluated (timeline not reached)
- **aging**: Claim is showing signs of being wrong but not definitively falsified
- **falsified**: Claim has been definitively proven wrong by AI progress

### Status Determination

**Falsified** when:
- AI demonstrably does what the claim said it couldn't
- Predicted failure timeline passed without failure
- Market prediction deadline passed without crash

**Aging** when:
- AI is making progress toward capability claim
- Market prediction looking increasingly unlikely
- AGI timeline claim looking pessimistic

**Pending** when:
- Timeline not yet reached
- Capability not yet demonstrable
- Prediction still plausible

## Editorial Process

1. **Discovery**: Automated pipeline finds candidates
2. **Scoring**: Quality rubric applied (automated + LLM)
3. **Filtering**: Must pass inclusion criteria
4. **Review**: Scores 35-49 get human review
5. **Publication**: Scores >= 50 auto-publish
6. **Monitoring**: Status updated as claims age

## Version History

- 2024-12-23: Initial quality criteria document
