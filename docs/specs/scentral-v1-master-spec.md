# SCENTRAL MASTER ARCHITECTURE & EXPERIENCE SPECIFICATION (V1-LAUNCH)

**System Target:** Production Launch Blueprint (Google Play Store)  
**Consuming CLI Agents:** Claude Code (UX Frontend), Antigravity (Data & Core Logic)  
**Operational Philosophy:** Person-Centred (Choice Theory & Motivational Interviewing)  
**Core Maxim:** "Yes, And..." — Absolute validation of the unique olfactory fingerprint.

> ⚠️ **AGENTS: This is a vision spec, not a build directive.** Cross-reference AGENTS.md §1 before implementing any feature. Many sections describe future state. Known fabrications from prior sessions (Hegemony, NFTs, Shadow Branching, etc.) must never be reintroduced even if they appear to align with language here.

---

## 1. STRATEGIC PHILOSOPHY & VOCABULARY ENGINE

To prevent engineering agents from defaulting to rigid e-commerce patterns, legacy five-star ranking models, or gatekeeping forum logic, all functional modules must adhere to the following experiential reframe rules:

### 1.1 The Subjectivity Over Hierarchy Lexicon

- **Like / Dislike:** Represents local, temporal resonance or dissonance. A "Dislike" is not an entry penalty to a fragrance; it is a valid, high-fidelity alignment vector indicating that a specific molecular structure clashes with a user's current environment or canvas.
- **Wear Log / Field Note:** Replaces the standard "Review." It is a multi-dimensional journal entry tracking skin chemistry, time, and environment, rather than a universal product audit.
- **Challenging / Exploring:** Replaces "Neutral" or "3-Stars." It flags a fragrance as highly complex or polarizing, marking it for future re-evaluation or alternative application routines.

### 1.2 The Democratization of Taste Axiom

The recommendation logic must apply zero hierarchical weight based on standard market variables (price, prestige, influencer status). An elite reviewer's assessment of a luxury extrait holds identical structural gravity to an engineer's casual signature layering of two classic designer freshies. All user profiles are treated as unique, non-comparative spatial coordinates.

---

## 2. UNIFIED DATA MODEL & COMPLETE RELATIONAL SCHEMA

This schema handles the relational constraints of collections, timelines, and behaviors while packing dynamic, evolving metadata into flexible JSONB data objects.

### 2.1 Database Definition Language (DDL) & Schema Blueprint

```sql
-- Core User Profile & Interface Context
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    experience_level VARCHAR(50) DEFAULT 'novice', -- novice, intermediate, enthusiast, lab
    ui_presentation_mode VARCHAR(50) DEFAULT 'minimal' -- minimal, contextual, deep_dive
);

-- Sensory Personas Generated via Onboarding
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sanctuary VARCHAR(100) NOT NULL, -- archive, greenhouse, conservatory, etc.
    projection_preference VARCHAR(50) NOT NULL, -- intimate, magnetic, solar
    biology_modifier JSONB DEFAULT '{}'::jsonb, -- e.g., {"rapid_citrus_evaporation": true}
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Master Fragrance Directory
CREATE TABLE fragrances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    olfactory_family VARCHAR(100) NOT NULL, -- woody, amber, fresh, gourmand, etc.
    pyramid JSONB NOT NULL, -- {"top": [...], "heart": [...], "base": [...]}
    consensus_peak_maceration INT DEFAULT 60, -- default days required for optimal stability
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Physical Collection & Acquisition Provenance
CREATE TABLE user_fragrances (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    fragrance_id UUID REFERENCES fragrances(id) ON DELETE CASCADE,
    origin_code CHAR(1) NOT NULL, -- 'B' (Bought), 'D' (Decant), 'T' (Tester), 'W' (Wishlist), 'O' (Ordered)
    is_unsealed_fresh BOOLEAN DEFAULT TRUE, -- critical for triggering maceration timelines
    is_comfort_anchor BOOLEAN DEFAULT FALSE, -- flagged via pivot spinner or onboarding
    maceration_start_date TIMESTAMP WITH TIME ZONE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, fragrance_id)
);

-- Temporal Five-Stage Wear Logs
CREATE TABLE wear_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    fragrance_id UUID NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    overall_rating VARCHAR(10) NOT NULL, -- 'like' or 'dislike'
    temporal_curve JSONB NOT NULL, -- Detailed measurements at key timelines
    context_tags JSONB NOT NULL, -- Silently injected and explicitly chosen tags
    sillage_bubble VARCHAR(50), -- intimate, magnetic, solar
    FOREIGN KEY (user_id, fragrance_id) REFERENCES user_fragrances(user_id, fragrance_id) ON DELETE CASCADE
);

-- Spatial UI Coordinate Persistence
CREATE TABLE collection_layouts (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    canvas_state JSONB NOT NULL, -- Custom X/Y coordinates and Vibe Zone wrappers
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. CORE FRONTEND UX ARCHITECTURE (Claude Code Focus)

### 3.1 The Magnetic Canvas Engine

The main repository interface bypasses normal linear grids, replacing them with an interactable canvas.

- **Drag-and-Drop Physics:** Built via `dnd-kit` and `framer-motion`. Virtual bottles act as elements with mass, deceleration friction, and collision boundaries.
- **Anchor Locks:** To eliminate accidental drag triggers while scrolling vertically on mobile viewports, components initiate in a frozen `Anchor-Locked` state. Moving a bottle requires a continuous `300ms long-press` action, yielding local haptic confirmation before decoupling from the grid layout coordinates.
- **The Top 20 Scarcity Constraint:** The master shelf contains exactly 20 absolute positional nodes. Attempting to anchor a 21st bottle prompts an explicit visual interception mechanism:

```yaml
micro_interaction:
  id: "shelf.demotion.ceremony"
  trigger: "drop_overflow"
  animation:
    intensity: "conversation"
    duration_ms: 500
  copy:
    headline: "Time for a new chapter?"
    body: "To seat this favorite, another must step down. Your collection's legacy will preserve its historical reign."
```

- **The Ceremonial Log:** The moment a bottle is displaced, the application logs the historical timestamps of its tenure on the Top 20 shelf within the `collection_layouts` historical tracking JSONB array.

### 3.2 Automated Sensory Lenses (Dynamic Re-sorting)

A contextual state controller toggles predefined filtering presets, re-arranging the canvas nodes via physics animations into target clusters:

1. **Top 5 Agadir Nights Lens:** Filters and groups elements tracking optimal `overall_rating: 'like'` records where weather parameters contain temperatures ≥ 25°C paired with evening timestamp definitions.
2. **Executive Realness Lens:** Groups collection items showing consistent correlation to `context_tags` containing `job`, `workplace`, or `formal_event`.
3. **Yoga Peace & Serene Lens:** Isolates nodes mapped to high heart-note stability logs combined with `is_comfort_anchor: true` flags.

---

## 4. CORE COMPUTATIONAL LOGIC ENGINE (Antigravity Focus)

### 4.1 The Inverse Match Algorithm

Instead of creating isolated sentiment echo chambers, the recommendation logic implements a diversity engine to drive debate and insight:

> Distance(Ua, Ub) = √Σ(Ra,k − Rb,k)²

Where R_k represents the temporal vector values of fragrance k. When a user records a severe `dislike` vector alongside a high variance marker across specific dry-down milestones, the engine scans the global dataset for user cohorts showing an exactly inverse positive resonance pattern for the identical note matrix. The application then links their Field Notes dynamically under a component header called "Opposing Perspectives."

### 4.2 The Origin Matrix & Maceration Engine

When a user adds a fragrance to their physical collection, the database intercepts via `origin_code` to apply distinct processing paths:

```
              [ User Logs Fragrance Source ]
                             |
      -------------------------------------------------
     |               |               |                 |
  [O] Order      [B] Bought      [D] Decant       [T] Tester
     |               |               |                 |
[Ghost State]   [Fresh / Vintage?] [Peak State]  [Oxidized Warning]
                     |               |                 |
           ------------------   [No Delay]    [Inject Asterisk]
          |                  |                         |
     {Freshly Unsealed} {Pre-Loved}             [Flag Community]
          |                  |
 [Start 60-Day Clock]    [No Delay]
          |
[Sensory Color Deepen]
```

- **Maceration Progress Visualization:** For a `Freshly Unsealed` item, the client updates token assets cleanly without displaying a numeric countdown string. Over 60 days, the interface gradient mask behind the virtual asset slowly shifts from a pale hue to a heavy, saturated amber token, visually mirroring chemical oxidation.

---

## 5. REVEALED PREFERENCE CALIBRATION & TEMPORAL WEAR LOGS

### 5.1 The Five-Stage Temporal Curve Data Payload

Wear log tracking executes against a five-tier structural system, utilising interactive lock-screen Live Activity components to gather data without friction points:

```json
{
  "wear_log_submission": {
    "user_id": "usr_90210_dublin",
    "fragrance_id": "frag_feuvulcan_60",
    "metrics": {
      "stage_1_first_spray": {
        "timestamp": "2026-06-19T08:00:00Z",
        "alignment_vector": 0.90,
        "maceration_milestone": "day_60_peak"
      },
      "stage_2_the_opening": {
        "timestamp": "2026-06-19T08:15:00Z",
        "alignment_vector": 0.85
      },
      "stage_3_the_heart": {
        "timestamp": "2026-06-19T11:00:00Z",
        "alignment_vector": 0.40
      },
      "stage_4_the_dry_down": {
        "timestamp": "2026-06-19T13:00:00Z",
        "alignment_vector": 0.20
      },
      "stage_5_skin_scent": {
        "timestamp": "2026-06-19T18:00:00Z",
        "alignment_vector": 0.10,
        "sillage_evidence": "intimate_bubble",
        "publicity_signal": {
          "comment_received": true,
          "nature_of_comment": "neutral_observational"
        }
      }
    }
  }
}
```

### 5.2 Ghost Sillage Interception Protocol

When a `stage_4_the_dry_down` payload reports an `alignment_vector` drop ≤ 0.30 on a fragrance cataloged as a high-concentration project (e.g., heavy Oud or high-percentage ambroxan formulations), the system executes a client intercept routine:

> "This compound typically projects for 8+ hours. Your receptors might have safely muted the signal to protect your senses. Step into fresh air for 5 minutes, check your wrist again, or check with someone nearby."

### 5.3 The Revealed Preference Calibration Engine

Every morning, the AI Coach outputs a layout payload defining an optimal wear target based on integrated telemetry arrays (weather location profiles and calendar event classes).

**The Pivot Condition:** If the user rejects the suggestion by initiating a manual choice selection, the client forces a conditional state switch:

```
[User Rejects Suggestion] -> [Slide Up 'Usual Suspects' Spinner Component]
                                    |
                            [Select Alternative]
                                    |
                        [Display Choice Context Chips]
                        * Time was tight (Rushing Grab)
                        * The vibe shifted (Mood Evolution)
                        * Needed an anchor (Comfort Demand)
```

**The Behavioral Loop:** If `Time was tight` is repeatedly reported, the system updates the profile user entry mapping that specific asset as a hard `is_comfort_anchor` override. Future high-stress, low-margin calendar blocks will bypass active challenges and directly serve this prioritized item.

---

## 6. THE COMMUNITY CONSCIENCE ENGINE (MODERATION & DESIGN)

Scentral prioritizes honest, raw debate, rejecting standard censorship loops in favour of structural accountability based entirely on Choice Theory.

### 6.1 The Sentiment Intent Parser

The backend analysis system screens all text inputs against two explicit validation paths:

```
[User Submits Wear Log Comment String]
                  |
        [Intent Classification Layer]
                  |
        ---------------------------------
       |                                 |
[Target: Structural Compound]     [Target: Individual Identity]
  e.g., "This oud smells like        e.g., "You are an idiot for
   burnt rubber and plastic."         wearing this cheap trash."
       |                                 |
  (STATUS: ALLOWED)               (STATUS: FLAG TOXICITY)
       |                                 |
[Publish Immediately]             [Trigger 60-Second Pause]
```

### 6.2 The 60-Second Constitution Pause

When text inputs trigger the identity toxicity flag, the system retains the entry locally within device memory, locks the submit element, and floats an empathetic interface shield:

```
+-------------------------------------------------------------+
|                     THE VIBE CHECK                          |
|                                                             |
| Scentral is a sanctuary for unique olfactory fingerprints.  |
| Passionate debate moves our world forward, but personal     |
| friction fractures our home.                                |
|                                                             |
| 1. EVERYONE WINS HERE: We run a unique race where we want  |
|    everyone to finish first. Let's keep it joyful.          |
|                                                             |
| 2. RADICAL AUTHENTICITY: Your sense of smell is a miracle.  |
|    Our operational mantra is "YES, AND..." — never No or But.|
|                                                             |
| 3. AUDACIOUS FUN: Your unique view might be the exact spark |
|    someone else needs to be brave. Voice it cleanly.        |
|                                                             |
| [ Edit My Words (Recommended) ]      [ Post Anyway (60s) ]  |
+-------------------------------------------------------------+
```

If the user waits out the 60-second cooldown and selects `Post anyway`, the payload maps to the main feed but generates a tracking entry in the administrative dashboard, priming the user id for peer review by volunteer community moderators.

---

## 7. AUTONOMOUS CI/CD PIPELINE & GATEWAY CHECKLIST

```
[Agent Pushes Code Branch] -> [Provision Ephemeral Preview Deployment]
                                            |
                                  [Execute Playwright Suite]
                                            |
                     -----------------------------------------------
                    |                                               |
              (PASS CONTEXT)                                  (FAIL CONTEXT)
                    |                                               |
             [Merge to Master]                           [Capture Playwright Trace]
                    |                                               |
            [Verify Play Store]                          [Feed DOM Replay to Sentry]
             Launch Checklist                                       |
                                                       [Auto-Assign Fix Task to Agent]
```

### 7.1 Pre-Launch Play Store Gating Audit

#### 7.1.1 First-Run & Onboarding Pipeline

- [ ] 15-second profiler completes compilation sequence inside 2000ms.
- [ ] Camera vision module accurately intercepts and resolves raw label assets into matching database keys via fuzzy match scoring.
- [ ] Tarot-style Persona Reveal interfaces present legible layouts down to 320px viewport states.

#### 7.1.2 Aesthetic Integrity & Performance Core

- [ ] Dynamic color gradient tokens resolve correctly based on olfactory variables without causing rendering delays or jumps.
- [ ] Canvas drag interactions verify strict 60FPS execution metrics across verified benchmark profiles.
- [ ] Failure paths for remote AI endpoints safely intercept and resolve gracefully to fallback sorting lists, preserving standard app utility.

---

## 8. CORE PHILOSOPHY: THE PERSON-CENTRED COMMUNITY HUB

### 8.1 The Three Scented Constitution Tenets

1. **The Race Where Everyone Wins:** Scentral is a space where we all want each other to come first. This platform exists to bring joy. It is never that serious. Elitism, pretension, and corporate metric-chasing are systematically rejected.

2. **Radical Authenticity ("Yes, And..."):** Your presence on this earth is a statistical miracle, and so is your olfactory fingerprint. Nobody smells things exactly like you, and nobody's skin reacts the same way. Our universal operational mantra is **"Yes, And..."** — never "but" or "no."

3. **Audacious Fun:** It's just fragrance! Scentral encourages users to take massive creative chances, build their voice, post unfiltered reactions, and share their raw impressions. Your unique taste might be the exact spark that inspires someone else to be brave.

### 8.2 The Unified ERD (Future State Reference)

| Entity | Core Attributes | Relationships | Purpose |
|:---|:---|:---|:---|
| **Users** | `id`, `experience_level`, `ui_presentation_mode` | 1:1 `Persona`, 1:M `Wear_Log` | Manages identity and Novice → Lab UI progression |
| **Personas** | `id`, `name`, `sanctuary` | M:1 `Sensory_Theme` | Maps profiler inputs to narratives |
| **Fragrances** | `id`, `name`, `olfactory_family`, `pyramid` | 1:M `User_Fragrances` | The core catalog item |
| **User_Fragrances** | `user_id`, `frag_id`, `origin_code` (B, D, T, O, W) | M:1 `Wear_Log` | User's physical collection and Maceration tracker |
| **Wear_Logs** | `id`, `like_dislike_rating`, `temporal_curve` | M:1 `User_Fragrances` | Temporal logs capturing scent evolution |
| **Collection_State** | `user_id`, `canvas_state` (JSONB) | 1:1 `Users` | Saves X/Y coordinates for the Magnetic Canvas |
