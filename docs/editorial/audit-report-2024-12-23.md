# AI Obituaries Quality Audit Report

**Date:** 2024-12-23
**Total Reviewed:** 136 obituaries
**Auditor:** Automated quality review against `docs/editorial/quality-criteria.md`

## Executive Summary

| Recommendation | Count | Percentage |
|----------------|-------|------------|
| KEEP | 73 | 54% |
| RECATEGORIZE | 25 | 18% |
| REVIEW | 26 | 19% |
| FLAG (Remove) | 30 | 22% |

*Note: Some items have multiple recommendations (e.g., KEEP + RECATEGORIZE)*

---

## Part 1: Items to Remove (FLAG)

### 1.1 Opposite Thesis Violations

These entries express AI SAFETY skepticism (worried AI is NOT dangerous enough), which is the **opposite** of AI capability skepticism. They belong in a different collection.

| ID | Slug | Source | Claim | Issue |
|----|------|--------|-------|-------|
| `5e7848ce-3788-4be9-a43b-ac0af44e35ec` | `ai-existential-threat-bs-lecun-2024` | Yann LeCun | "Worries about AI's existential threat are complete B.S." | LeCun argues AI ISN'T dangerous - opposite of capability skepticism |
| `19861f2a-1df7-4adb-bb0f-106185bc5701` | `llms-obsolete-five-years-lecun-2025` | Yann LeCun | "Current LLMs will be largely obsolete within five years" | OPTIMISTIC prediction - believes better AI will replace LLMs |
| `f5348ce0-1021-4866-a81b-a60652996afc` | `gebru-toxic-guardian-2023` | Timnit Gebru | "AI's dangers and big tech's biases" | About AI dangers (opposite thesis) |
| `f5d013c8-3407-4f35-86b1-1489a0c5985b` | null | Timnit Gebru | "AI safety from existential risk is a distraction" | Meta-criticism, not capability skepticism |
| `df91ac55-b46c-4273-be77-df6748376e52` | null | Timnit Gebru | "AI race narrative is manufactured" | Corporate criticism, not AI capability claim |

### 1.2 Stock Analyst Downgrades (Not AI Skepticism)

Pure financial analysis unrelated to AI capabilities:

| ID | Slug | Source | Claim | Issue |
|----|------|--------|-------|-------|
| `obituary-multiple-analysts-downgraded-nvidia-following-q3-2018-weakne-4` | `multiple-analysts-downgraded-nvidia-following-q3-2018-weakne-4` | Morgan Stanley, Bank of America | "Multiple analysts downgraded NVIDIA following Q3 2018 weakness" | Stock analysis, not AI skepticism |
| `obituary-nvidia-got-it-so-wrong-no-one-will-trust-ceo-for-a-while-and-5` | `nvidia-got-it-so-wrong-no-one-will-trust-ceo-for-a-while-and-5` | Jim Cramer | "NVIDIA got it so wrong no one will trust CEO for a while" | Stock commentary |
| `obituary-analyst-downgraded-nvidia-from-market-perform-to-underperfor-1` | `analyst-downgraded-nvidia-from-market-perform-to-underperfor-1` | BMO Capital Markets | "Analyst downgraded NVIDIA from market perform to underperform" | Stock analysis |

### 1.3 Question Headlines (Unfalsifiable)

Headlines framed as questions don't make falsifiable predictions:

| ID | Slug | Source | Claim | Issue |
|----|------|--------|-------|-------|
| `b42fa849-8ff9-4ecd-bc5e-cdf100adc58b` | `heading-ai-winter-soon-forbes-2019` | Forbes | "Are We Heading For Another AI Winter Soon?" | Question format |
| `5b9b8e94-ebab-450d-8be1-efc151bcf0df` | `ai-winter-coming-fortune-2025` | Fortune | "Is an 'AI winter' coming?" | Question format |
| `797e9a18-2c24-472d-ab2e-6caaa7b823e4` | `ai-bubble-burst-diplo-2025` | DiploFoundation | "Is the AI bubble about to burst?" | Question format |
| `0d70d19c-a039-4d88-94a6-476f51a8b36b` | `ai-bubble-research-nature-2025` | Nature | "If the AI bubble bursts, what will it mean?" | Hypothetical, not prediction |
| `006cb337-ddf3-4a2e-8f62-2b2f5adbcca2` | `ai-winter-forbes-2025` | Forbes | "Are We Heading Into Another AI Winter?" | Question format |

### 1.4 Reasonable Caution / Meta-Criticism (Not Predictions)

| ID | Slug | Source | Claim | Issue |
|----|------|--------|-------|-------|
| `1crO578Kg9GLw1Z6pERZgx` | `ai-materials-discovery-is-hyped-but-waiting-for-its-breakthrough-moment-there-s-` | MIT Tech Review | "AI materials discovery is hyped but waiting for its breakthrough moment" | Reasonable observation, not prediction of failure |
| `1eee377d-a727-4329-a72e-fb72434d08ea` | `ai-hype-correction-2025-mit` | MIT Tech Review | "The great AI hype correction of 2025" | Describing current sentiment, not prediction |
| `4729dc94-6c5d-49c6-aebd-e149a4f93487` | `ai-coding-gaps-mit-2025` | MIT Tech Review | "Developers navigating confusing gaps between expectation and reality" | Observational reporting |
| `a05d538e-5c65-4714-9d65-bebcda229c98` | `bank-of-england-ai-bubble-2025` | BBC News | "Bank of England warns of AI bubble risk" | Institutional risk assessment |
| `152c526e-2a6b-4426-853e-e177a6b95c78` | `ai-coding-engineers-skeptical-npr-2025` | NPR | "Some software engineers are skeptical" | Reporting on sentiment |
| `08e43fcd-3007-4e74-ac1b-95ebdb4364d4` | `ai-vibe-shift-cnn-2025` | CNN Business | "The AI vibe shift is upon us" | Cultural commentary |
| `f8cac9d5-21f0-4e9b-8760-a480c9af971a` | `ai-slowing-down-cnbc-2024` | CNBC | "Why AI advancement could be slowing down" | Too hedged ("could be") |
| `497efb43-b784-4e72-940e-161e8606f945` | `ai-plateau-arstechnica-2024` | Ars Technica | "What if AI doesn't just keep getting better forever?" | Hypothetical question |
| `b6fc73ec-1696-4744-b16c-a224558dbe8e` | `silicon-valley-ai-bubble-fears-2025` | BBC News | "Fears over AI bubble bursting grow" | Reporting on fears |
| `79cd0c0a-d9a5-48dc-82c4-9e807a041600` | null | Emily Bender | "The term 'AI' itself is misleading marketing" | Semantic debate, not capability claim |
| `f0754afa-db89-4829-924d-3d0648707014` | null | Timnit Gebru | "Tech companies using 'emergent capabilities' as marketing hype" | Corporate criticism |
| `18fe16af-f9bc-49f0-be76-5cb95cf9b918` | `ai-hype-cycle-distracting-hbr-2023` | HBR | "The AI Hype Cycle Is Distracting Companies" | Business advice, not prediction |
| `3e66368f-c6ec-4c76-ac35-09c4857a8f2c` | `cant-trust-deep-learning-alone-2019` | MIT Tech Review | "We can't trust AI systems built on deep learning alone" | Engineering best practice |
| `21438cd5-c02a-4452-9b11-937be4a974b6` | `marcus-deepmind-go-hype-2016` | Gary Marcus | "Separating hype from reality is not always easy" | Media criticism, no specific claim |
| `obituary-just-because-you-can-create-more-inputs-doesnt-mean-it-will-6` | `just-because-you-can-create-more-inputs-doesnt-mean-it-will-6` | Ryan Caldwell | "Just because you can create more inputs doesn't mean it will be valid" | Too vague, unclear context |

### 1.5 Duplicates

| Keep | Remove | Reason |
|------|--------|--------|
| `kelly-ai-cant-be-artist-2019` (180e4a14) | `ai-never-be-artist-2019` (b779fb42) | Same article, same date, same source |
| `piekniewski-ai-winter-2018` (c5910d8e) | `predicting-the-ai-winter-is-like-predicting-a-stock-market-c-2` (obituary-predicting) | Same blog post |

### 1.6 Weak Attribution / Unfalsifiable

| ID | Slug | Source | Issue |
|----|------|--------|-------|
| `obituary-ai-art-is-not-real-art-it-is-soulless-image-generation-that-47` | `ai-art-is-not-real-art-it-is-soulless-image-generation-that-47` | "Various artists in forums" | No credible source, unfalsifiable aesthetic judgment |
| `obituary-its-not-there-yet-not-even-close-its-way-too-unreliable-to-b-45` | `its-not-there-yet-not-even-close-its-way-too-unreliable-to-b-45` | "Various Medium commentators" | No attribution |
| `obituary-ai-as-a-bad-word-in-1991-48` | `ai-as-a-bad-word-in-1991-48` | Usama Fayyad | Historical description, not prediction |
| `931f5ad4-fa71-4fcd-a93d-baf60c71246c` | `no-agi-arxiv-2019` | "arXiv" | No author attribution |

---

## Part 2: Items to Recategorize

### 2.1 capability → capability-reasoning

Claims about LLM understanding, intelligence, reasoning:

| ID | Slug | Current | New | Claim |
|----|------|---------|-----|-------|
| `ea6d3d9a-3d40-4748-8e7d-0e171239b263` | `llms-100-percent-memorization-chollet-2024` | capability | capability-reasoning | "LLMs = 100% memorization" |
| `623a718a-caa1-4446-92d1-aa62d733b1b0` | `gpt4-cant-reason-arxiv-2023` | capability | capability-reasoning | "GPT-4 Can't Reason" |
| `c10a87dd-b75d-4081-95a5-a956ae4e2c15` | `llms-lack-common-sense-mitchell-2023` | capability | capability-reasoning | "LLMs lack common sense" |
| `22c770a7-aa99-4a89-aabc-13a3a7dcd0d8` | `house-cat-smarter-llm-lecun-2023` | dismissive | capability-reasoning | "House cat has more common sense than LLM" |
| `obituary-llms-haphazardly-stitch-together-sequences-of-linguistic-for-40` | `llms-haphazardly-stitch-together-sequences-of-linguistic-for-40` | dismissive | capability-reasoning | "Stochastic parrots" paper |
| `obituary-we-have-to-keep-in-mind-that-when-llm-output-is-correct-that-41` | `we-have-to-keep-in-mind-that-when-llm-output-is-correct-that-41` | dismissive | capability-reasoning | "LLM output correct by chance" |
| `131d77e9-2266-4f79-8df4-6e66e02633a6` | `gpt4-lacks-robust-reasoning-mitchell-2025` | capability | capability-reasoning | "GPT-4 lacks robust reasoning" |
| `5883da0b-d4ad-4c1f-9f4f-b5e609acfcbe` | `chatgpt-not-cracked-up-marcus-2025` | capability, dismissive | capability-reasoning | "ChatGPT still isn't what it was cracked up to be" |
| `dbd21bce-d502-4111-bac8-374ff7a715db` | `llms-not-like-humans-marcus-2025` | capability, agi | capability-reasoning | "LLMs are not like you and me—and never will be" |
| `9366e747-f12c-4360-b1ee-c7c82ccd734f` | `gpt4-not-intelligent-bender-2023` | agi | capability-reasoning | "GPT-4 is not intelligent" |
| `obituary-the-human-mind-is-not-like-chatgpt-and-its-ilk-a-lumbering-s-35` | `the-human-mind-is-not-like-chatgpt-and-its-ilk-a-lumbering-s-35` | agi | capability-reasoning | "Lumbering statistical engine" |

### 2.2 capability → capability-narrow

Claims about specific tasks AI cannot do:

| ID | Slug | Current | New | Claim |
|----|------|---------|-----|-------|
| `180e4a14-da2b-4228-96b4-7538f74556a7` | `kelly-ai-cant-be-artist-2019` | capability, dismissive | capability-narrow | "AI can never be an artist" |
| `78c0c7b1-11dd-4f59-ac30-642a9a376f49` | `ai-wont-replace-programmers-2023` | capability, dismissive | capability-narrow | "AI Won't Replace Programmers" |
| `04fd26a1-88ce-444b-9a76-0eda6e3fe0ef` | `self-driving-decades-off-bi-2023` | capability | capability-narrow | "Self-driving cars decades off" |
| `01499665-b207-4d13-8f26-3e85203f63d4` | `self-driving-decades-away-wsj-2021` | capability | capability-narrow | "Self-Driving Cars Could Be Decades Away" |
| `73219e7c-b23d-4f95-b166-d0d3a2a06b5d` | `self-driving-cars-not-happening-2022` | capability, dismissive | capability-narrow | "Self-driving cars aren't going to happen" |
| `01b94b5b-5eb8-4f78-a0bc-c56d910e6a0d` | `100-billion-self-driving-nowhere-2022` | capability, market | capability-narrow, market | "$100 Billion, Self-Driving Cars Going Nowhere" |
| `2198f29e-e0dd-4f2c-af72-a24fb5e89563` | `wired-go-computers-cant-win-2014` | capability | capability-narrow | "Go beyond reach of AI" |
| `obituary-before-alphago-some-researchers-had-claimed-that-computers-w-12` | `before-alphago-some-researchers-had-claimed-that-computers-w-12` | capability | capability-narrow | "Computers would never defeat top humans at Go" |
| `obituary-go-requires-human-intuition-that-computers-fundamentally-lac-13` | `go-requires-human-intuition-that-computers-fundamentally-lac-13` | capability | capability-narrow | "Go requires human intuition computers lack" |
| `3bc97b24-d9ed-4e47-b63c-5f4762c6aee5` | `iolante-machine-translation-never-2017` | capability | capability-narrow | "Machine translations will never replace human translators" |
| `02badd46-2fc6-4234-bb0b-7ad6b73cd2bb` | `humanoid-bubble-burst-brooks-2025` | market, capability | capability-narrow, market | "Humanoid robot bubble doomed to burst" |
| `1e274cbb-7ed3-4b1a-a587-8d4da2ca3589` | `humanoids-dexterity-brooks-2025` | capability, agi | capability-narrow | "Today's Humanoids Won't Learn Dexterity" |
| `e6b36553-29e3-4218-b267-93a8bac367b2` | `musk-robots-fantasy-brooks-2025` | agi, dismissive | capability-narrow | "Humanoid robot assistants is 'pure fantasy'" |

### 2.3 agi → capability-reasoning

Claims about LLM intelligence, not AGI timelines:

| ID | Slug | Current | New | Reason |
|----|------|---------|-----|--------|
| `f41eaf65-8adf-474f-beb0-635e0a9d3252` | `llms-dead-end-lecun-2023` | agi | agi, capability-reasoning | Add capability-reasoning |
| `85a6243b-1a31-46b8-a866-c3eecbd8c7f3` | `lecun-ai-never-true-intelligence-2022` | agi, capability | agi, capability-reasoning | Swap capability for capability-reasoning |

---

## Part 3: Status Updates

### 3.1 Set to `falsified`

Claims demonstrably proven wrong:

| ID | Slug | Claim | Falsified By |
|----|------|-------|--------------|
| `2198f29e-e0dd-4f2c-af72-a24fb5e89563` | `wired-go-computers-cant-win-2014` | "Go beyond reach of AI" | AlphaGo (2016) |
| `obituary-before-alphago-some-researchers-had-claimed-that-computers-w-12` | Go computers never beat | "Computers never defeat top humans at Go" | AlphaGo (2016) |
| `obituary-go-requires-human-intuition-that-computers-fundamentally-lac-13` | Go human intuition | "Go requires human intuition" | AlphaGo (2016) |
| `obituary-i-think-maybe-ten-years-but-i-do-not-like-to-make-prediction-11` | `i-think-maybe-ten-years-but-i-do-not-like-to-make-prediction-11` | "Ten years" for Go | AlphaGo beat Lee Sedol 2 years later |
| `73219e7c-b23d-4f95-b166-d0d3a2a06b5d` | `self-driving-cars-not-happening-2022` | "Self-driving cars aren't going to happen" | Waymo commercial service |
| `180e4a14-da2b-4228-96b4-7538f74556a7` | `kelly-ai-cant-be-artist-2019` | "AI can never be an artist" | DALL-E, Midjourney, Stable Diffusion |
| `89f6e115-2c5c-480e-9b69-03c958cf1407` | `generative-ai-peaked-hbr-2023` | "Has Generative AI Peaked?" (Nov 2023) | GPT-4V, Claude 3, Sora, GPT-4o |
| `c3a43010-29f6-4978-b82e-5e6539f6e8cd` | `gen-ai-cold-shower-2024-cnbc` | "GenAI will get cold shower in 2024" | 2024 was biggest AI year |
| `4bd7adcf-d265-41e5-9d9c-998e3ab65c7f` | `chatgpt-loses-users-wapo-2023` | "ChatGPT loses users, shaking faith" | ChatGPT rebounded to 200M+ users |
| `6d8aab67-bc42-4d7f-9d54-d72049524600` | `arnott-nvidia-bubble-2023` | "Nvidia bubble, could trigger market crash" | NVDA up ~240% since |
| `obituary-nvidia-corporations-stock-price-gain-of-45-since-august-make-8` | `nvidia-corporations-stock-price-gain-of-45-since-august-make-8` | "NVDA steep sell-off in 2024 more likely" | NVDA up massively in 2024 |
| `obituary-nvidia-faces-imminent-risk-from-ethereum-20-transition-that-10` | `nvidia-faces-imminent-risk-from-ethereum-20-transition-that-10` | "NVIDIA imminent risk from Ethereum 2.0" | AI demand replaced crypto |
| `9ce25464-a6fd-47ac-ba11-75d56733dd1e` | `genai-winter-signs-marcus-2024` | "First signs of GenAI Winter" | GenAI investment/adoption grew |
| `7d05efee-64c1-4c80-ada3-cc9321e7ff4b` | `cusp-ai-winter-bbc-2020` | "Cusp of an AI winter?" | AI boom accelerated |
| `obituary-i-think-another-ai-winter-is-coming-i-think-this-skepticism-3` | `i-think-another-ai-winter-is-coming-i-think-this-skepticism-3` | "AI Winter coming 2019-2020" | Opposite happened |
| `c5910d8e-fc2a-4e40-9720-641f8fc0530f` | `piekniewski-ai-winter-2018` | "AI winter is well on its way" | Deep learning breakthroughs continued |
| `obituary-we-may-already-be-running-into-scaling-limits-in-deep-learni-28` | `we-may-already-be-running-into-scaling-limits-in-deep-learni-28` | "Scaling starts to falter" (2022) | GPT-4, Claude 3, Gemini scaled successfully |
| `obituary-simple-neural-networks-couldnt-solve-basic-problems-like-xor-20` | `simple-neural-networks-couldnt-solve-basic-problems-like-xor-20` | "Neural networks can't solve XOR" | Multi-layer networks solved this |
| `obituary-ai-has-failed-to-achieve-its-grandiose-objectives-and-nothin-21` | `ai-has-failed-to-achieve-its-grandiose-objectives-and-nothin-21` | "AI has failed its objectives" | Modern AI achievements |

### 3.2 Set to `aging`

Claims showing signs of being wrong but not definitively falsified:

| ID | Slug | Claim | Why Aging |
|----|------|-------|-----------|
| `0e2f4600-f4f9-4c5e-8d17-5de9ec25e65c` | `llms-wont-lead-to-agi-chollet-2024` | "LLMs won't lead to AGI" | o1, o3 showing reasoning improvements |
| `f41eaf65-8adf-474f-beb0-635e0a9d3252` | `llms-dead-end-lecun-2023` | "LLMs are dead end for AGI" | LLMs + RL showing progress |
| `ea6d3d9a-3d40-4748-8e7d-0e171239b263` | `llms-100-percent-memorization-chollet-2024` | "LLMs = 100% memorization" | Emergent capabilities suggest more |
| `623a718a-caa1-4446-92d1-aa62d733b1b0` | `gpt4-cant-reason-arxiv-2023` | "GPT-4 Can't Reason" | o1 chain-of-thought reasoning |
| `c10a87dd-b75d-4081-95a5-a956ae4e2c15` | `llms-lack-common-sense-mitchell-2023` | "LLMs lack common sense" | Improving on commonsense benchmarks |
| `22c770a7-aa99-4a89-aabc-13a3a7dcd0d8` | `house-cat-smarter-llm-lecun-2023` | "House cat smarter than LLM" | LLMs passing professional exams |
| `1a00bdbe-7965-45f3-8f1a-941cbfe485cf` | `game-over-agi-not-imminent-marcus-2025` | "Game over, AGI not imminent" | AGI timelines shortening |
| `obituary-llms-haphazardly-stitch-together-sequences-of-linguistic-for-40` | Stochastic parrots | "Haphazardly stitch together" | Coherent long-form generation |
| `1e8bce21-4e1b-446d-9f8a-e691aa3e0d24` | `chomsky-false-promise-chatgpt-2023` | "Flawed conception of language" | LLMs passing language tests |
| `90e0d8dd-b595-40f0-816d-f4f518600ef4` | `ai-not-make-art-chiang-2024` | "AI won't make art" | AI art winning competitions |
| `obituary-the-llm-systems-are-designed-in-such-a-way-that-they-cannot-36` | Chomsky LLMs irremediable | "Cannot tell us anything about cognition" | LLMs useful for cognitive research |
| Most capability-reasoning claims | Various | Various | Models improving on targeted benchmarks |

### 3.3 Set to `pending`

Claims that cannot yet be evaluated:

| ID | Slug | Claim | Why Pending |
|----|------|-------|-------------|
| `50773b64-e912-4df8-b2ac-d8a63ea7c8f0` | `agi-will-not-happen-in-your-lifetime-marcus-2023` | "AGI will not happen in your lifetime" | Timeline not reached |
| `acc95217-dcb6-4ce8-8263-b87b62979555` | `chinese-room-searle-1980` | "Computers cannot have understanding" | Philosophical, ongoing debate |
| `obituary-the-quality-of-conscious-understanding-is-something-essentia-33` | Penrose consciousness | "Consciousness distinct from computation" | Unfalsified philosophical claim |
| `88734d98-fba7-4ceb-b5da-531831081839` | `why-agi-will-not-happen-dettmers-2025` | "Why AGI Will Not Happen" | Recent, timeline not reached |
| `e83fe6ed-240c-4ba7-b5ae-e23981728c99` | `lecun-agi-bs-2025` | "AGI is complete BS" | Recent, definitional debate |
| `1ff43743-af4e-4c8d-be48-60055b002449` | `ai-boom-4-bubble-signs-2025` | "Could pop in 2026" | Timeline not reached |
| Historical philosophical claims | Dreyfus, Searle, Penrose | Various | Foundational debates continue |

---

## Part 4: Missing Data Fixes

### 4.1 Items Missing Slugs

Need to generate slugs:

| ID | Source | Date | Suggested Slug |
|----|--------|------|----------------|
| `fea6e097-2399-4443-b391-162e0f28a380` | François Chollet | 2024-02-15 | `scaling-laws-diminishing-chollet-2024` |
| `87768628-0715-4d14-a536-1194c6afdf7f` | Gary Marcus | 2024-01-22 | `nowhere-near-agi-marcus-2024` |
| `3ba11625-abf1-4ad3-a740-3d0da4ed1db1` | François Chollet | 2023-11-08 | `arc-llms-cant-generalize-chollet-2023` |
| `0742938c-517c-447c-b765-89cf5cd4cb1c` | Melanie Mitchell | 2023-10-05 | `dl-brittleness-mitchell-2023` |
| `ce055b4b-1483-42f3-9dd6-5029e374b604` | Yann LeCun | 2023-09-15 | `llms-no-world-models-lecun-2023` |
| `8ad45cc2-8624-40b9-a0ac-d3a62249250b` | Yann LeCun | 2023-06-28 | `autoregressive-never-agi-lecun-2023` |
| `18bbb73e-ad61-4eec-b583-b6598cfe4d78` | Melanie Mitchell | 2023-05-18 | `ai-lacks-abstraction-mitchell-2023` |
| `35fbfe79-9bdf-40d8-8db6-eee329a31294` | Gary Marcus | 2023-03-15 | `gpt4-not-reliable-marcus-2023` |

### 4.2 Items Missing Categories

| ID | Slug | Source | Recommended Categories |
|----|------|--------|------------------------|
| `fea6e097-2399-4443-b391-162e0f28a380` | (needs slug) | François Chollet | capability-reasoning, agi |
| `87768628-0715-4d14-a536-1194c6afdf7f` | (needs slug) | Gary Marcus | agi |
| `3ba11625-abf1-4ad3-a740-3d0da4ed1db1` | (needs slug) | François Chollet | capability-reasoning |
| `0742938c-517c-447c-b765-89cf5cd4cb1c` | (needs slug) | Melanie Mitchell | capability-reasoning |
| `ce055b4b-1483-42f3-9dd6-5029e374b604` | (needs slug) | Yann LeCun | capability-reasoning |
| `8ad45cc2-8624-40b9-a0ac-d3a62249250b` | (needs slug) | Yann LeCun | agi |
| `18bbb73e-ad61-4eec-b583-b6598cfe4d78` | (needs slug) | Melanie Mitchell | capability-reasoning |
| `35fbfe79-9bdf-40d8-8db6-eee329a31294` | (needs slug) | Gary Marcus | capability-narrow |

---

## Part 5: Quality Scores

### 5.1 Highest Quality Obituaries (90+/100)

| Score | Slug | Source | Claim |
|-------|------|--------|-------|
| 98 | `chinese-room-searle-1980` | John Searle | "Chinese Room argument" |
| 94 | `penrose-emperors-new-mind` | Roger Penrose | "Consciousness distinct from computation" |
| 91 | `minsky-papert-perceptrons` | Minsky & Papert | "Perceptrons can't solve XOR" |
| 90 | `lighthill-ai-failed` | James Lighthill | "AI has failed its objectives" |
| 90 | `chomsky-llms-irremediable` | Noam Chomsky | "LLMs irremediable" |
| 90 | `llms-dead-end-lecun-2023` | Yann LeCun | "LLMs are dead end for AGI" |
| 90 | `kelly-ai-cant-be-artist-2019` | Sean Kelly | "AI can never be an artist" |

### 5.2 Lowest Quality (Consider Removal)

| Score | Slug | Source | Issue |
|-------|------|--------|-------|
| 25 | `ai-art-not-real` | "Various artists" | Anonymous, unfalsifiable |
| 45 | `chatgpt-unreliable-medium` | "Various Medium" | No attribution |
| ~50 | Question headlines | Various | Unfalsifiable format |

---

## Part 6: Implementation Checklist

### Phase 1: Removals (30 items)
- [ ] Unpublish opposite thesis entries (5)
- [ ] Unpublish stock analyst downgrades (3)
- [ ] Unpublish question headlines (5)
- [ ] Unpublish reasonable caution entries (15)
- [ ] Unpublish duplicates (2)

### Phase 2: Category Updates (~25 items)
- [ ] Update capability → capability-reasoning (11)
- [ ] Update capability → capability-narrow (13)
- [ ] Add missing categories (8)

### Phase 3: Status Updates (~50 items)
- [ ] Set falsified status (18)
- [ ] Set aging status (~25)
- [ ] Set pending status (~10)

### Phase 4: Data Quality (~8 items)
- [ ] Add missing slugs
- [ ] Fix date inconsistencies

---

## Appendix: Full Item List by Recommendation

### A. KEEP (73 items)
High-quality items meeting all criteria - no changes needed except possible status updates.

### B. RECATEGORIZE (25 items)
See Part 2 for full list.

### C. REVIEW (26 items)
Borderline items needing human judgment.

### D. FLAG/REMOVE (30 items)
See Part 1 for full list with reasons.
