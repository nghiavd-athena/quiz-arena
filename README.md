# Quiz Arena

A single-page quiz web app with gamification — streaks, multipliers, a timer, and a leaderboard. No build step, no dependencies.

## Features

- **4 categories:** Claude AI, Game Design, Science, General Knowledge (or mix all)
- **3 difficulty levels:** Easy (20s), Medium (15s), Hard (10s)
- **Streak multipliers:** 3-in-a-row = 2×, 5-in-a-row = 3× points
- **Answer review:** After each game, review every question with the correct answer, your choice, and an explanation
- **Leaderboard:** Top 10 scores saved in localStorage

## Running

Requires a local HTTP server (fetch blocks `file://` URLs in most browsers):

```bash
npx serve .
# or
python3 -m http.server
```

Then open the URL shown (e.g. `http://localhost:3000`).

## Project Structure

```
quiz-arena/
├── index.html          # App shell — all screens as hidden <section> elements
├── data/
│   └── questions.json  # Question bank (questions, categories, difficulties)
└── src/
    ├── app.js          # Game logic and state machine
    ├── logic.js        # Pure functions (used by app.js and tests)
    ├── questions.js    # Node.js adapter — reads questions.json for tests
    └── style.css       # Dark theme, animations, responsive layout
```

## Screens

| Screen      | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| Start       | Name input, category picker, difficulty picker               |
| Game        | Progress bar, streak badge, timer, question card             |
| Results     | Score, accuracy, time, best streak                           |
| Review      | Per-question breakdown with correct answers and explanations |
| Leaderboard | Top 10 scores                                                |

## Adding Questions

Edit `data/questions.json`. Each question follows this shape:

```json
{
  "id": 24,
  "category": "science",
  "difficulty": "medium",
  "question": "Your question text?",
  "answers": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 1,
  "explanation": "Why this answer is correct."
}
```

- `correct` is the zero-based index into `answers`
- `category` must match one of the ids in the `categories` array
- `difficulty` must be `"easy"`, `"medium"`, or `"hard"`

## Tests

```bash
npm test
```

Runs 52 unit tests covering game logic, data integrity, and utilities.
