# Rap Beat Prompt Engine

> A stack-agnostic prompt generation framework for rap, hip-hop, trap, drill, boom bap, phonk, and hybrid beat creation across AI music platforms, local audio pipelines, and creative studio workflows.

---

## Status

**Version:** 0.2.0  
**Stage:** Architecture + Prompt System Specification  
**Primary Use Case:** Generate structured, high-quality rap beat prompts from cleaned style data, project presets, and creative intent.  
**Designed For:** Suno, Udio, MusicGen/AudioCraft, Stable Audio, local generation backends, DAW-adjacent tools, and custom music applications.

---

## Overview

The **Rap Beat Prompt Engine** turns raw genre/style vocabulary into production-ready prompts.

Instead of generic prompts like:

```text
rap beat
```

it produces structured prompts like:

```text
dark Memphis trap rap, haunting piano loop, heavy 808 sub bass, aggressive male rap vocals, triplet flow, gritty street atmosphere, cinematic mix
```

The engine is intentionally **stack agnostic**. It can run as:

- a standalone CLI
- a frontend component
- a backend API service
- a notebook workflow
- a local desktop tool
- a plugin inside a larger AI music system
- a prompt layer inside an existing audio generation pipeline

It does not require a specific framework, database, model, or vendor.

---

## Why This Exists

AI music tools respond better to precise sonic direction than broad genre labels.

Rap and hip-hop prompts are especially sensitive to details such as:

- **region** — Atlanta, Memphis, East Coast, West Coast, UK, Chicago, Detroit
- **era** — 90s, 2000s, 2010s, modern
- **subgenre** — boom bap, trap, drill, phonk, horrorcore, G-Funk
- **drums and bass** — punchy boom bap drums, sliding 808s, triplet hats
- **instrumentation** — dark piano, dusty vinyl sample, orchestral strings, guitar loop
- **vocal delivery** — melodic autotune hook, aggressive rap, raspy storytelling, chopper flow
- **mood** — noir, spiritual, luxury, street, cinematic, emotional
- **mix texture** — raw analog, polished club, underground cassette, cinematic master

The engine solves the “generic output” problem by enforcing a repeatable prompt structure.

---

## Core Principle

A strong rap beat prompt should answer these questions:

1. What style or subgenre is it?
2. What region or scene does it reference?
3. What era or production period should it feel like?
4. What drums and bass should drive the rhythm?
5. What instruments or samples shape the melody?
6. What vocal delivery should sit on top?
7. What emotional world does the track live in?
8. What mix texture should the final output have?
9. What styles should be excluded to prevent drift?

---

## Prompt Formula

### Base Formula

```text
[Era/Region] + [Style] + [Drums/Bass] + [Instrumentation] + [Vocal Delivery] + [Mood] + [Mix Texture]
```

### Expanded Formula

```text
{era} {region} {style}, {drums}, {bass}, {instrumentation}, {vocal_delivery}, {mood}, {mix_texture}
```

### Optional Full Formula

```text
{era} {region} {style}, {tempo} BPM, {drums}, {bass}, {instrumentation}, {vocal_delivery}, {song_section_focus}, {mood}, {mix_texture}, {platform_hint}
```

### Example

```text
90s East Coast boom bap, 92 BPM, dusty vinyl soul sample, punchy kick and snare, warm upright bass, gritty male storytelling rap, cold city night atmosphere, raw analog mix
```

---

## Engine Architecture

The engine is organized into independent layers. Each layer can be implemented in any language or framework.

```text
raw data
   ↓
style vocabulary
   ↓
classification
   ↓
attribute enrichment
   ↓
preset selection
   ↓
prompt assembly
   ↓
quality scoring
   ↓
export / API / UI / audio generation
```

---

## Layer 1: Style Vocabulary

Stores raw genre, subgenre, regional, vocal, and production terms.

Examples:

```text
boom bap
trap soul
uk drill
memphis phonk
g-funk
horrorcore
jazz rap
conscious hip-hop
orchestral trap
detroit rap
atlanta trap
```

### Vocabulary Sources

The initial vocabulary can come from:

- scraped CSV files
- manually curated genre lists
- project-specific prompt banks
- producer notes
- previous successful prompts
- AI-generated expansions
- tag exports from music platforms
- DAW session metadata
- artist-safe style descriptions

---

## Layer 2: Classification

Each raw style is classified into a useful production family.

Recommended families:

```text
classic_hip_hop
boom_bap
trap
drill
phonk
g_funk
dark_rap
melodic_rap
emo_rap
conscious_rap
regional_rap
lofi_rap
experimental_rap
fusion_rap
vocal_delivery
production_style
adjacent_genre
weak_or_generic
```

### Classification Example

```json
{
  "style_name": "memphis phonk",
  "style_family": "phonk",
  "region": "Memphis",
  "energy": "dark",
  "mood": ["haunted", "underground", "gritty"],
  "drums_bass": ["heavy 808", "distorted bass", "trap drums"],
  "instrumentation": ["eerie sample", "dark synth", "minor piano"],
  "mix_texture": "gritty underground cassette"
}
```

---

## Layer 3: Attribute Enrichment

After classification, each style receives creative metadata.

Recommended attributes:

| Field | Purpose |
|---|---|
| `style_name` | Clean style name |
| `style_family` | Main category |
| `region` | Geographic scene or cultural source |
| `era` | Production era |
| `energy` | Chill, aggressive, dark, luxury, emotional |
| `mood` | Emotional or cinematic tone |
| `tempo_range` | Suggested BPM range |
| `vocal_delivery` | Rap/singing/flow direction |
| `drums` | Drum style |
| `bass` | Bass type |
| `instrumentation` | Melody and sample palette |
| `mix_texture` | Sonic finish |
| `exclude_styles` | Negative prompt / drift prevention |
| `platform_notes` | Suno, Udio, MusicGen, local model notes |

---

## Layer 4: Presets

Presets define repeatable creative identities.

A preset can represent a project, album, artist lane, campaign, or mood world.

### Example Preset

```json
{
  "preset_id": "cold_case_noir",
  "display_name": "Cold Case Noir",
  "default_family": "boom_bap",
  "region": "East Coast",
  "era": "90s",
  "energy": "dark",
  "mood": "cold case detective atmosphere",
  "drums": "punchy boom bap drums",
  "bass": "walking bassline",
  "instrumentation": "dusty vinyl jazz sample",
  "vocal_delivery": "gritty male storytelling rap",
  "mix_texture": "raw analog mix",
  "exclude_styles": "happy pop, tropical house, EDM drop, children's music"
}
```

---

## Layer 5: Prompt Builder

The builder combines style attributes, user intent, and presets into finished prompts.

### Input Contract

```json
{
  "intent": "dark street anthem",
  "style_family": "trap",
  "style_name": "dark Memphis trap",
  "region": "Memphis",
  "era": "modern",
  "energy": "aggressive",
  "mood": "gritty street atmosphere",
  "vocal_delivery": "aggressive male rap vocals",
  "instrumentation": "haunting piano loop",
  "drums": "crisp triplet hi-hats",
  "bass": "heavy 808 sub bass",
  "mix_texture": "cinematic mix",
  "duration": 30,
  "instrumental": true
}
```

### Output Contract

```json
{
  "prompt": "modern Memphis dark trap rap, haunting piano loop, crisp triplet hi-hats, heavy 808 sub bass, aggressive male rap vocals, gritty street atmosphere, cinematic mix",
  "exclude_styles": "happy pop, acoustic folk, tropical house, children's music",
  "score": 95,
  "family": "trap",
  "notes": [
    "Includes region, subgenre, instrumentation, drums, bass, vocal delivery, mood, and mix texture.",
    "Strong prompt for Suno, Udio, or local text-to-music models."
  ]
}
```

---

## Layer 6: Quality Scoring

The engine can score prompts from 0 to 100.

| Category | Points |
|---|---:|
| Specific subgenre | 15 |
| Region or era included | 10 |
| Drums specified | 10 |
| Bass specified | 10 |
| Instrumentation specified | 15 |
| Vocal delivery specified | 15 |
| Mood specified | 15 |
| Mix texture specified | 5 |
| No conflicting terms | 5 |

### Strong Prompt

```text
dark Memphis trap rap, haunting piano loop, crisp triplet hi-hats, heavy 808 sub bass, aggressive male rap vocals, gritty street atmosphere, cinematic mix
```

Score: `95/100`

### Weak Prompt

```text
cool rap beat
```

Score: `15/100`

---

## Data Model

### Minimal CSV Schema

```csv
style_name,style_family,region,era,energy,mood,vocal_delivery,drums_bass,instrumentation,mix_texture,suno_style_prompt,exclude_styles
```

### Recommended CSV Schema

```csv
style_id,style_name,style_family,region,era,tempo_min,tempo_max,energy,mood,vocal_delivery,drums,bass,instrumentation,mix_texture,platform_hint,exclude_styles,quality_score,tags,notes
```

### JSON Style Object

```json
{
  "style_id": "trap_memphis_dark",
  "style_name": "dark Memphis trap",
  "style_family": "trap",
  "region": "Memphis",
  "era": "modern",
  "tempo_min": 130,
  "tempo_max": 150,
  "energy": "aggressive",
  "mood": ["dark", "street", "haunted"],
  "vocal_delivery": ["aggressive male rap", "triplet flow"],
  "drums": ["trap drums", "crisp hi-hats"],
  "bass": ["heavy 808 sub bass"],
  "instrumentation": ["haunting piano loop"],
  "mix_texture": "cinematic mix",
  "exclude_styles": ["happy pop", "acoustic folk", "tropical house"],
  "tags": ["trap", "memphis", "dark", "street"]
}
```

---

## Prompt Categories

### Classic Hip-Hop

```text
boom bap
golden age hip-hop
old school hip-hop
east coast hip-hop
jazz rap
conscious hip-hop
battle rap
freestyle rap
```

### Trap

```text
atlanta trap
dark trap
melodic trap
street trap
luxury trap
orchestral trap
trap soul
cloud trap
emo trap
```

### Drill

```text
chicago drill
uk drill
brooklyn drill
new york drill
melodic drill
dark drill
sample drill
jersey drill
```

### Dark Rap

```text
horrorcore
dark rap
gothic rap
occult rap
phonk rap
memphis phonk
trap metal
industrial trap
```

### Emotional Rap

```text
emo rap
melodic rap
sad rap
pain rap
heartbreak rap
autotune rap
trap ballad
introspective rap
```

### Regional Rap

```text
new york rap
west coast rap
atlanta rap
memphis rap
houston rap
detroit rap
chicago rap
bay area rap
uk rap
toronto rap
```

### Fusion

```text
rap rock
country rap
country trap
jazz fusion rap
soul rap
funk rap
r&b rap fusion
pop rap
```

---

## Project Presets

These presets were identified as useful creative lanes for the engine.

### Cold Case

```text
dark East Coast boom bap, dusty vinyl jazz sample, punchy kick and snare, walking bassline, gritty male storytelling rap, cold case detective atmosphere, raw analog mix
```

### Blue King

```text
orchestral trap rap, booming 808 sub bass, dramatic strings, dark piano chords, confident male melodic rap, royal legacy mood, cinematic street anthem mix
```

### Rabbit Skin

```text
gothic rap, eerie choir pads, heavy trap drums, distorted 808 bass, raspy male rap vocals, haunted backwoods atmosphere, dark cinematic mix
```

### Gas Fee

```text
modern Atlanta trap rap, crisp hi-hats, deep 808 bass, icy synth bells, melodic autotune hook, luxury tech hustle mood, polished club mix
```

### Sacred Sin

```text
spiritual conscious rap, soulful gospel chords, warm boom bap drums, deep bass, emotional male rap vocals, redemption and regret atmosphere, intimate analog mix
```

### Ethereum Chain Talk

```text
futuristic trap rap, digital synth arpeggios, crisp 808 drums, deep sub bass, confident melodic rap vocals, crypto-night hustle atmosphere, polished neon mix
```

---

## Usage Modes

The engine can be used in several ways.

### 1. Manual Prompt Generator

Use the formula directly.

```text
{era} {region} {style}, {drums}, {bass}, {instrumentation}, {vocal_delivery}, {mood}, {mix_texture}
```

### 2. CLI Tool

Example command shape:

```bash
prompt-engine generate \
  --preset cold_case \
  --style boom_bap \
  --energy dark \
  --platform suno
```

Example output:

```json
{
  "prompt": "90s East Coast boom bap, dusty vinyl jazz sample, punchy kick and snare, walking bassline, gritty male storytelling rap, cold case detective atmosphere, raw analog mix",
  "exclude_styles": "EDM drop, tropical house, happy pop",
  "score": 97
}
```

### 3. API Service

Example endpoint shape:

```http
POST /api/prompt-engine/generate
```

Example body:

```json
{
  "preset": "blue_king",
  "style_family": "trap",
  "platform": "suno",
  "instrumental": true
}
```

### 4. Frontend Component

A UI can expose controls for:

- preset
- style family
- region
- era
- energy
- mood
- drums
- bass
- instrumentation
- vocal delivery
- mix texture
- exclude styles
- prompt score
- copy/send/generate action

### 5. Local Audio Pipeline Adapter

A local generator can pass the finished prompt into any text-to-audio backend.

Generic payload:

```json
{
  "prompt": "dark cinematic trap beat, 94 BPM, heavy 808, triplet hats, noir atmosphere",
  "duration": 30,
  "instrumental": true
}
```

---

## Stack-Agnostic Integration

The engine is independent from any one implementation.

### Frontend Options

Can be implemented with:

- React
- Next.js
- Vue
- Svelte
- Solid
- plain HTML/JavaScript
- Electron
- Tauri
- mobile UI
- DAW plugin UI

### Backend Options

Can be implemented with:

- Python / FastAPI / Flask
- Node.js / Express / Hono / NestJS
- Go
- Rust
- Java / Spring
- .NET
- serverless functions
- local scripts

### Storage Options

Can use:

- CSV
- JSON
- SQLite
- PostgreSQL
- Supabase
- MySQL
- MongoDB
- local file storage
- vector database
- no database at all

### Model / Audio Targets

Can target:

- Suno
- Udio
- MusicGen / AudioCraft
- Stable Audio
- Replicate-hosted models
- local diffusion audio models
- custom generation services
- DAW workflows
- prompt-only human production

---

## Reference Implementation Shape

A clean project layout can look like this:

```text
rap-beat-prompt-engine/
├── README.md
├── data/
│   ├── raw/
│   │   └── sunoprompt.csv
│   ├── cleaned/
│   │   └── rap_styles_clean.csv
│   └── presets/
│       └── project_presets.json
├── prompts/
│   ├── templates.md
│   ├── examples.md
│   └── exclude_styles.md
├── src/
│   ├── clean_styles.*
│   ├── classify_styles.*
│   ├── build_prompts.*
│   ├── score_prompts.*
│   └── validate_prompts.*
├── adapters/
│   ├── suno.*
│   ├── udio.*
│   ├── musicgen.*
│   └── local_pipeline.*
└── tests/
    ├── prompt_builder.test.*
    └── scoring.test.*
```

The `*` extension is intentional. Use the language that fits your stack.

---

## Platform Notes

### Suno / Udio

Use concise but detailed style prompts.

Good style prompt:

```text
dark Memphis trap rap, haunting piano loop, heavy 808 sub bass, aggressive male rap vocals, triplet flow, gritty street atmosphere, cinematic mix
```

For lyrics-based generation, keep the style prompt separate from the lyrics whenever the platform supports it.

### MusicGen / Local Models

MusicGen-style models often respond well to direct sonic descriptions:

```text
dark cinematic trap beat, 94 BPM, heavy 808 sub bass, triplet hi-hats, haunting piano melody, noir atmosphere, instrumental
```

### Human Producer Notes

For DAW use, the engine can produce session briefs:

```text
Tempo: 94 BPM
Drums: trap hats with boom bap snare
Bass: heavy 808 sub
Melody: haunting minor piano loop
Mood: noir, cold case, street tension
Mix: cinematic low-end, dark reverb, analog grit
```

---

## Exclude Styles

Exclude styles prevent model drift.

### Dark Trap Exclusions

```text
happy pop, acoustic folk, bright dance pop, children's music, upbeat reggae
```

### Boom Bap Exclusions

```text
EDM drop, hyperpop, country, polished pop vocals, tropical house
```

### Drill Exclusions

```text
lo-fi chillhop, soft acoustic ballad, funk pop, reggae, country rock
```

### Spiritual Conscious Rap Exclusions

```text
violent horrorcore, club EDM, novelty rap, comedy vocals, bubblegum pop
```

---

## Quality Rules

### Strong Prompt Rules

A strong prompt should include:

- specific subgenre
- region or era
- drum identity
- bass identity
- instrumentation
- vocal delivery
- mood
- mix texture
- exclude styles when supported

### Weak Terms To Flag

These terms are too vague when used alone:

```text
rap
hip-hop
beat
song
urban
cool
modern
hard
dark
vibe
```

They can still be useful when paired with specific context.

### Conflicting Terms To Check

Avoid combinations that fight each other unless intentional:

```text
lo-fi raw analog + polished EDM festival drop
dark horrorcore + happy children's music
90s boom bap + hyperpop bubblegum synths
acoustic folk ballad + heavy drill 808s
```

---

## Safety and Originality Guidelines

The engine should avoid prompts that directly request imitation of a living artist’s exact voice or identity.

Prefer:

```text
melodic autotune trap vocals, emotional late-night delivery, polished Atlanta-inspired mix
```

Avoid:

```text
make it exactly like [living artist]
```

Use descriptive musical attributes instead of direct impersonation.

---

## Cleaning Workflow

Recommended data-cleaning steps:

1. Import raw CSV or style list.
2. Extract style terms from article/scrape noise.
3. Normalize casing and punctuation.
4. Remove duplicate entries.
5. Flag weak or non-style terms.
6. Classify each style into a family.
7. Add region, era, energy, and mood.
8. Add drums, bass, instrumentation, vocal delivery, and mix texture.
9. Generate baseline prompt.
10. Score prompt quality.
11. Export cleaned CSV and JSON.

---

## Validation Checklist

Before exporting a prompt, verify:

- [ ] Has a specific style or subgenre
- [ ] Has either region or era
- [ ] Mentions drums
- [ ] Mentions bass
- [ ] Mentions instrumentation
- [ ] Mentions vocal delivery or says instrumental
- [ ] Mentions mood
- [ ] Mentions mix texture
- [ ] Has no obvious conflicts
- [ ] Includes exclude styles when platform supports them

---

## Example API Specification

### Generate Prompt

```http
POST /api/prompt-engine/generate
```

Request:

```json
{
  "preset": "cold_case",
  "style_family": "boom_bap",
  "platform": "suno",
  "instrumental": false
}
```

Response:

```json
{
  "prompt": "90s East Coast boom bap, dusty vinyl jazz sample, punchy kick and snare, walking bassline, gritty male storytelling rap, cold case detective atmosphere, raw analog mix",
  "exclude_styles": "EDM drop, tropical house, happy pop",
  "score": 97,
  "metadata": {
    "style_family": "boom_bap",
    "region": "East Coast",
    "era": "90s",
    "mood": "cold case detective atmosphere"
  }
}
```

### Score Prompt

```http
POST /api/prompt-engine/score
```

Request:

```json
{
  "prompt": "cool rap beat"
}
```

Response:

```json
{
  "score": 15,
  "issues": [
    "Missing specific subgenre",
    "Missing drums",
    "Missing bass",
    "Missing instrumentation",
    "Missing mood",
    "Missing mix texture"
  ],
  "suggested_prompt": "modern trap rap, crisp hi-hats, heavy 808 sub bass, dark piano loop, confident male rap vocals, late-night street atmosphere, polished club mix"
}
```

---

## Example UI Flow

```text
Choose Preset
   ↓
Choose Style Family
   ↓
Choose Region / Era
   ↓
Choose Energy / Mood
   ↓
Choose Drums / Bass / Instrumentation
   ↓
Choose Vocal Delivery
   ↓
Generate Prompt
   ↓
Review Score
   ↓
Copy / Export / Send to Audio Generator
```

---

## Roadmap

### Phase 1: Prompt Library Foundation

- [ ] Clean raw style CSV
- [ ] Deduplicate style names
- [ ] Classify style families
- [ ] Create project presets
- [ ] Generate baseline prompt library
- [ ] Add exclude-style defaults

### Phase 2: Engine Core

- [ ] Implement prompt builder
- [ ] Implement scoring system
- [ ] Implement conflict detection
- [ ] Implement CSV and JSON export
- [ ] Add CLI or script interface

### Phase 3: Integrations

- [ ] Add frontend component
- [ ] Add backend API route
- [ ] Add local audio pipeline adapter
- [ ] Add Suno/Udio prompt export mode
- [ ] Add MusicGen/local-model prompt mode

### Phase 4: Intelligence Layer

- [ ] Add prompt critique
- [ ] Add prompt rewriting
- [ ] Add mood expansion
- [ ] Add style similarity search
- [ ] Add prompt memory / vault
- [ ] Add feedback loop from generated audio analysis

### Phase 5: Studio Workflow

- [ ] Generate beat briefs
- [ ] Generate hook/verse arrangement notes
- [ ] Generate project-specific packs
- [ ] Generate album prompt maps
- [ ] Connect prompt quality to generated audio metadata
- [ ] Build complete prompt-to-audio review loop

---

## Implementation Notes From Existing Songine/Musaix-Style App

The engine can plug into an existing AI music app as the prompt layer.

A common integration pattern:

```text
Rap Beat Prompt Engine UI
   ↓
Generated prompt + exclude styles + score
   ↓
Local generation studio / text-to-audio backend
   ↓
Audio generation
   ↓
Audio analysis
   ↓
Prompt refinement
```

If an app already has a text prompt box and a generation endpoint, this engine only needs to supply better prompts. It does not need to replace the existing audio backend.

---

## Naming

Recommended package/project names:

```text
rap-beat-prompt-engine
rbpe
songine-prompt-engine
musaix-prompt-engine
alic3x-rap-engine
```

---

## License

MIT License recommended.

---

## Credits

Built for AI-assisted rap, hip-hop, and beat prompt generation workflows.

Designed to transform messy style data, scraped prompt lists, and project-specific creative lanes into clean, structured, reusable prompt systems.
