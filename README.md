# Calendar App

A simple, responsive month-view calendar built with plain HTML, CSS, and JavaScript — no frameworks or dependencies.

## Features

- **Month grid** — 7-column layout (Sun–Sat, US format) with leading/trailing days
- **Add events** — click any day cell or the + button to open the add-event modal
- **Edit & delete** — click an existing event chip to edit or delete it
- **Persistent storage** — events are saved to `localStorage` as JSON and survive page reloads
- **Responsive** — works on desktop and mobile (event chips collapse to color dots on small screens)
- **Validation** — title and date are required; end time must be after start time

## Getting Started

No build step or server required. Just open the file in your browser:

```
open index.html
```

## Project Structure

```
calendar-ai/
├── index.html   # App shell and modal markup
├── styles.css   # Layout, grid, modal, and responsive styles
└── main.js      # State, rendering, CRUD, localStorage, validation
```

## Usage

| Action | How |
|--------|-----|
| Navigate months | Click **‹** / **›** in the header |
| Add an event | Click any day cell or the **+** button |
| Edit an event | Click the event chip on the calendar |
| Delete an event | Open the event, click **Delete** |

## Data Format

Events are stored in `localStorage` under the key `calendar-events`:

```json
[
  {
    "id": "uuid",
    "title": "Team standup",
    "date": "2026-03-27",
    "startTime": "09:00",
    "endTime": "09:30",
    "description": "Daily sync"
  }
]
```

## Browser Support

Works in all modern browsers that support the native `<dialog>` element (Chrome 37+, Firefox 98+, Safari 15.4+).
