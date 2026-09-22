# Student Academic Dashboard

A single-page web app for tracking academic life as a student — assignments, exams, syllabus progress, and attendance, all linked to subjects and summarized on a dashboard.

Built with **vanilla HTML, CSS, and JavaScript** — no frameworks, no build tools, no backend. Data persists in the browser using `localStorage`.

**[Live Demo](https://ehetrams.github.io/student-dashboard/)**

![Dashboard Screenshot]() 

---

## Features

- **Subjects** — add/delete subjects, each with a topic list
- **Assignments** — add assignments linked to a subject, sorted by due date, with overdue highlighting and mark-as-done
- **Exams** — track upcoming exams with days-remaining countdown and topics to revise
- **Syllabus tracking** — check off completed topics per subject with a live progress bar
- **Attendance** — log present/absent per subject, with a low-attendance warning below 75%
- **Dashboard summary** — auto-generated overview: assignments due this week, subjects with low attendance, days to next exam, and average syllabus completion across all subjects
- **Persistent storage** — all data survives a page refresh via `localStorage`
- **Responsive layout** — CSS Grid's `auto-fill`/`minmax()` for fluid, breakpoint-free responsive card layouts

---

## Tech Stack

| | |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (Flexbox, Grid, custom properties) |
| Logic | Vanilla JavaScript (ES6+) |
| Storage | Browser `localStorage` |
| Build tools | None — no framework, no bundler |

---

## Project Structure

```
student-dashboard/
├── index.html
├── style.css
├── scripts.js
└── README.md
```

---

## How It Works

All app data lives in a single JavaScript object (`appState`) with three arrays: `subjects`, `assignments`, and `exams`. Assignments and exams reference a subject by `subjectId` — the same relational idea as a foreign key in a database, implemented in plain JS arrays.

```js
appState = {
  subjects: [ { id, name, totalTopics, completedTopics, allTopics, attendance } ],
  assignments: [ { id, subjectId, title, dueDate, status } ],
  exams: [ { id, subjectId, date, topicsToRevise } ]
}
```

Every state change follows the same cycle: **update the data → save to `localStorage` → re-render the affected section from scratch.** This "clear and rebuild" rendering pattern keeps the UI always in sync with the underlying data, without a framework.

Deleting a subject also cascades — removing any assignments/exams linked to it via `subjectId`, so the data never has orphaned references.

---

## Key Implementation Details

- **Event delegation** — Delete/action buttons are dynamically generated, so click listeners are attached once to each list's parent container (not to individual buttons) and rely on event bubbling. This avoids re-attaching listeners every time the list re-renders.
- **`localStorage` persistence** — App state is serialized with `JSON.stringify()` on save and parsed back with `JSON.parse()` on load, since `localStorage` only stores strings.
- **Derived dashboard metrics** — The summary cards (assignments due this week, average syllabus progress, etc.) are calculated live from the raw data using array methods like `.filter()`, `.find()`, and `.reduce()`, rather than stored as separate values.
- **Responsive grid** — Subject cards use `grid-template-columns: repeat(auto-fill, minmax(230px, 1fr))`, letting the browser calculate column count from available width with no media queries needed.

---

## Getting Started

No installation or build step required.

1. Clone the repo:
   ```bash
   git clone https://github.com/ehetrams/student-dashboard.git
   ```
2. Open `index.html` in a browser — that's it.

---

## What I Learned

- Structuring related data across multiple arrays using an id-based reference pattern (similar to foreign keys)
- Managing UI state manually: sync data → save → re-render, the same core loop that frontend frameworks automate
- Event delegation and why it's necessary for dynamically created elements
- Working with dates in JavaScript: comparing due dates, calculating days remaining
- Building responsive layouts with CSS Grid without relying on media queries

---

## Possible Future Improvements

- Media queries for finer mobile spacing/typography adjustments
- Form validation (prevent past exam dates, duplicate subjects, etc.)
- Switch from `innerHTML` templating to safer DOM construction to avoid potential XSS from user-entered text
- Export/import data as JSON for backup
- Multi-page navigation (separate views instead of one long scroll)