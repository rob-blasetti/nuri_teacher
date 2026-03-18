# Nuri Teacher 1.0 Roadmap

## 1.0 Goal
Ship a version of Nuri Teacher that a real teacher can use to prepare for class, run a class, and keep lightweight records.

By 1.0, a teacher should be able to:
- sign in securely
- see their community's classes
- create a children's class
- open lessons by grade and set
- run a class session
- mark attendance
- capture quick student progress and notes
- finish a session
- review locally saved session summaries

---

## Phase 1 — Core Class Workflow
**Status:** Mostly in place

### Done / near-done
- auth gateway login
- backend user/community lookup
- community class loading
- create class flow
- Home and Community class views
- live students derived from class participants

### Remaining
- polish create-class UX
  - better inputs/pickers
  - stronger validation
  - better success/error feedback
- improve consistency between class list, home cards, and in-class entry points
- remove leftover seed/local assumptions where still present

**Milestone:** Class management feels stable and coherent.

---

## Phase 2 — Lesson Experience
**Status:** Strong progress

### Done
- Grade 1 lesson content imported
- Grade 2 lesson sets imported
- lesson detail UX improved
- section-aware lesson styling
- Grades 3–5 marked as coming soon

### Remaining
- drawing/art asset support
- print/download flow for lesson-related assets
- refine formatting edge cases in imported lesson content
- import more grades later

**Milestone:** Lesson content is clear, pleasant, and usable during teaching.

---

## Phase 3 — In-Class Mode
**Status:** Strong progress

### Done
- start class from Home
- class header and context
- current lesson context in class mode
- attendance toggles
- per-student progress markers
- per-student quick notes
- finish class summary
- persist local session summaries
- show recent session history
- reopen past local session summaries
- save session-level notes locally

### Next
- create a lightweight session log model for future sync
- tighten summary/history metadata and UX
- add more obvious save/reopen feedback where needed

**Milestone:** A teacher can run a class and keep local records.

---

## Phase 4 — Student Workflow
**Status:** Strong progress

### Done
- students list sourced from live class participants
- backend student IDs preserved for future API integration
- Student Detail shows linked classes
- Student Detail surfaces recent local notes/progress where available
- backend student detail route integrated when available

### Needed for 1.0
- refine Student Detail presentation and empty states
- prepare for later backend student detail APIs without blocking 1.0

**Milestone:** The student tab is useful before deeper backend sync arrives.

---

## Phase 5 — Reliability and App Polish
### Needed
- stronger loading / error / empty states
- mobile spacing and consistency pass
- remove obvious UX rough edges
- stabilize image/media loading
- test critical flows end-to-end
- tighten TestFlight beta readiness

**Milestone:** The app feels intentional and stable, not stitched together.

---

# 1.0 Scope Line

## Must-have for 1.0
- secure sign-in
- Face ID session unlock
- community class list
- create class
- lessons by grade/set
- in-class attendance
- student progress markers
- student quick notes
- local session summary persistence
- useful Student Detail with local history
- basic UX polish

## Nice-to-have, but not required for 1.0
- passkey login
- full student detail API integration
- backend sync of session summaries
- print/download lesson art packs
- Grades 3–5 content
- advanced analytics/reporting

---

# Recommended Build Order From Here

## Next 1
**Polish create-class flow**
- better pickers and form controls
- smarter grade / curriculum lesson selection
- clearer validation and feedback states

## Next 2
**Tighten in-class history UX**
- richer summary/history metadata
- clearer save/reopen states
- cleaner session list presentation

## Next 3
**1.0 polish pass**
- consistency
- performance
- loading states
- QA and release prep

## Next 4
**Future-ready local session model**
- lightweight structure for eventual backend sync
- preserve room for richer class-level notes/reporting

---

# Definition of Nuri Teacher 1.0
If a teacher can:
1. log in
2. see their classes
3. create a class
4. open lesson content
5. run a real session
6. track attendance and quick student progress
7. save and review that session locally

then Nuri Teacher has reached a credible 1.0.
