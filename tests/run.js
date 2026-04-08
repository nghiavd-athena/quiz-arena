'use strict'

const {
  shuffle,
  getMultiplier,
  calculatePoints,
  formatTime,
  escapeHtml,
  calculateAccuracy,
  getTrophy,
  addToLeaderboard,
  filterQuestions,
  difficultySeconds,
  POINTS_PER_QUESTION,
  STREAK_2X_THRESHOLD,
  STREAK_3X_THRESHOLD,
  LEADERBOARD_MAX
} = require('../src/logic')

const { QUESTIONS, CATEGORIES, DIFFICULTIES } = require('../src/questions')

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  PASS: ${name}`)
    passed++
  } catch (e) {
    console.log(`  FAIL: ${name}`)
    console.log(`        ${e.message}`)
    failed++
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed')
}

// ── shuffle ───────────────────────────────────────────────────────────────────

test('shuffle preserves array length', () => {
  const original = [1, 2, 3, 4, 5]
  const result = shuffle(original)
  assert(
    result.length === original.length,
    `Expected length ${original.length}, got ${result.length}`
  )
})

test('shuffle does not mutate original array', () => {
  const original = [1, 2, 3, 4]
  const copy = original.slice()
  shuffle(original)
  assert(
    original.every((v, i) => v === copy[i]),
    'Original array should be unchanged'
  )
})

test('shuffle contains all original elements', () => {
  const original = [1, 2, 3, 4, 5]
  const result = shuffle(original)
  const sorted = (arr) => arr.slice().sort((a, b) => a - b)
  assert(
    JSON.stringify(sorted(result)) === JSON.stringify(sorted(original)),
    'Shuffled array should contain same elements'
  )
})

test('shuffle handles empty array', () => {
  const result = shuffle([])
  assert(result.length === 0, 'Should return empty array')
})

test('shuffle handles single element', () => {
  const result = shuffle([42])
  assert(result[0] === 42 && result.length === 1, 'Should return same single-element array')
})

// ── getMultiplier ─────────────────────────────────────────────────────────────

test('getMultiplier returns 1 with no streak', () => {
  assert(getMultiplier(0) === 1, 'Expected 1x for streak 0')
})

test('getMultiplier returns 1 below 2x threshold', () => {
  assert(getMultiplier(STREAK_2X_THRESHOLD - 1) === 1, 'Expected 1x just below threshold')
})

test('getMultiplier returns 2 at 2x threshold', () => {
  assert(getMultiplier(STREAK_2X_THRESHOLD) === 2, `Expected 2x at streak ${STREAK_2X_THRESHOLD}`)
})

test('getMultiplier returns 2 between thresholds', () => {
  assert(getMultiplier(STREAK_2X_THRESHOLD + 1) === 2, 'Expected 2x between thresholds')
})

test('getMultiplier returns 3 at 3x threshold', () => {
  assert(getMultiplier(STREAK_3X_THRESHOLD) === 3, `Expected 3x at streak ${STREAK_3X_THRESHOLD}`)
})

test('getMultiplier returns 3 above 3x threshold', () => {
  assert(getMultiplier(STREAK_3X_THRESHOLD + 10) === 3, 'Expected 3x for very high streak')
})

// ── calculatePoints ───────────────────────────────────────────────────────────

test('calculatePoints returns base points with no streak', () => {
  assert(calculatePoints(0) === POINTS_PER_QUESTION, `Expected ${POINTS_PER_QUESTION}`)
})

test('calculatePoints doubles at 2x streak', () => {
  assert(
    calculatePoints(STREAK_2X_THRESHOLD) === POINTS_PER_QUESTION * 2,
    `Expected ${POINTS_PER_QUESTION * 2}`
  )
})

test('calculatePoints triples at 3x streak', () => {
  assert(
    calculatePoints(STREAK_3X_THRESHOLD) === POINTS_PER_QUESTION * 3,
    `Expected ${POINTS_PER_QUESTION * 3}`
  )
})

// ── formatTime ────────────────────────────────────────────────────────────────

test('formatTime formats seconds correctly', () => {
  assert(formatTime(5000) === '5s', `Expected "5s", got "${formatTime(5000)}"`)
})

test('formatTime rounds to nearest second', () => {
  assert(formatTime(5500) === '6s', `Expected "6s", got "${formatTime(5500)}"`)
})

test('formatTime formats minutes correctly', () => {
  assert(formatTime(125000) === '2m 5s', `Expected "2m 5s", got "${formatTime(125000)}"`)
})

test('formatTime formats exactly 1 minute', () => {
  assert(formatTime(60000) === '1m 0s', `Expected "1m 0s", got "${formatTime(60000)}"`)
})

test('formatTime handles zero', () => {
  assert(formatTime(0) === '0s', `Expected "0s", got "${formatTime(0)}"`)
})

// ── escapeHtml ────────────────────────────────────────────────────────────────

test('escapeHtml escapes ampersand', () => {
  assert(escapeHtml('a & b') === 'a &amp; b', 'Should escape &')
})

test('escapeHtml escapes less-than', () => {
  assert(escapeHtml('<script>') === '&lt;script&gt;', 'Should escape < and >')
})

test('escapeHtml escapes double quotes', () => {
  assert(escapeHtml('"hello"') === '&quot;hello&quot;', 'Should escape "')
})

test('escapeHtml leaves safe strings unchanged', () => {
  assert(escapeHtml('Hello World') === 'Hello World', 'Safe string should be unchanged')
})

test('escapeHtml coerces non-strings', () => {
  assert(escapeHtml(42) === '42', 'Should coerce numbers to string')
})

// ── calculateAccuracy ─────────────────────────────────────────────────────────

test('calculateAccuracy returns 100 for all correct', () => {
  const answers = [{ correct: true }, { correct: true }, { correct: true }]
  assert(calculateAccuracy(answers) === 100, 'Expected 100%')
})

test('calculateAccuracy returns 0 for all wrong', () => {
  const answers = [{ correct: false }, { correct: false }]
  assert(calculateAccuracy(answers) === 0, 'Expected 0%')
})

test('calculateAccuracy returns correct percentage', () => {
  const answers = [{ correct: true }, { correct: true }, { correct: false }, { correct: false }]
  assert(calculateAccuracy(answers) === 50, `Expected 50%, got ${calculateAccuracy(answers)}%`)
})

test('calculateAccuracy rounds to nearest integer', () => {
  const answers = [{ correct: true }, { correct: false }, { correct: false }]
  assert(calculateAccuracy(answers) === 33, `Expected 33%, got ${calculateAccuracy(answers)}%`)
})

test('calculateAccuracy returns 0 for empty answers', () => {
  assert(calculateAccuracy([]) === 0, 'Expected 0% for empty array')
})

// ── getTrophy ─────────────────────────────────────────────────────────────────

test('getTrophy returns gold trophy for 100%', () => {
  const { trophy } = getTrophy(100)
  assert(trophy === '🏆', `Expected 🏆, got ${trophy}`)
})

test('getTrophy returns 🥇 for 80-99%', () => {
  assert(getTrophy(80).trophy === '🥇', 'Expected 🥇 at 80%')
  assert(getTrophy(99).trophy === '🥇', 'Expected 🥇 at 99%')
})

test('getTrophy returns 🥈 for 60-79%', () => {
  assert(getTrophy(60).trophy === '🥈', 'Expected 🥈 at 60%')
  assert(getTrophy(79).trophy === '🥈', 'Expected 🥈 at 79%')
})

test('getTrophy returns 🥉 for 40-59%', () => {
  assert(getTrophy(40).trophy === '🥉', 'Expected 🥉 at 40%')
  assert(getTrophy(59).trophy === '🥉', 'Expected 🥉 at 59%')
})

test('getTrophy returns 🏅 for below 40%', () => {
  assert(getTrophy(0).trophy === '🏅', 'Expected 🏅 at 0%')
  assert(getTrophy(39).trophy === '🏅', 'Expected 🏅 at 39%')
})

// ── addToLeaderboard ──────────────────────────────────────────────────────────

test('addToLeaderboard sorts by score descending', () => {
  const board = [{ score: 50 }, { score: 80 }]
  const result = addToLeaderboard(board, { score: 65 })
  assert(result[0].score === 80, 'Highest score should be first')
  assert(result[1].score === 65, 'Second highest should be second')
  assert(result[2].score === 50, 'Lowest score should be last')
})

test('addToLeaderboard caps at LEADERBOARD_MAX entries', () => {
  const board = Array.from({ length: LEADERBOARD_MAX }, (_, i) => ({
    score: (LEADERBOARD_MAX - i) * 10
  }))
  const result = addToLeaderboard(board, { score: 1 })
  assert(
    result.length === LEADERBOARD_MAX,
    `Expected ${LEADERBOARD_MAX} entries, got ${result.length}`
  )
})

test('addToLeaderboard drops lowest score when at capacity', () => {
  const board = Array.from({ length: LEADERBOARD_MAX }, (_, i) => ({ score: (i + 1) * 10 }))
  const minScore = Math.min(...board.map((e) => e.score))
  const result = addToLeaderboard(board, { score: 999 })
  assert(result[0].score === 999, 'New high score should be first')
  assert(!result.find((e) => e.score === minScore), 'Lowest score should be dropped')
})

test('addToLeaderboard does not mutate original board', () => {
  const board = [{ score: 50 }]
  addToLeaderboard(board, { score: 100 })
  assert(board.length === 1, 'Original board should be unchanged')
})

test('addToLeaderboard works with empty board', () => {
  const result = addToLeaderboard([], { score: 50, name: 'Alice' })
  assert(result.length === 1, 'Should have one entry')
  assert(result[0].score === 50, 'Should contain the entry')
})

// ── filterQuestions ───────────────────────────────────────────────────────────

test('filterQuestions returns all for "mix"', () => {
  const result = filterQuestions(QUESTIONS, 'mix')
  assert(result.length === QUESTIONS.length, 'Mix should return all questions')
})

test('filterQuestions returns only matching category', () => {
  const result = filterQuestions(QUESTIONS, 'claude')
  assert(result.length > 0, 'Should have claude questions')
  assert(
    result.every((q) => q.category === 'claude'),
    'All should be claude category'
  )
})

test('filterQuestions returns empty for unknown category', () => {
  const result = filterQuestions(QUESTIONS, 'unknown_category')
  assert(result.length === 0, 'Should return empty for unknown category')
})

// ── difficultySeconds ─────────────────────────────────────────────────────────

test('difficultySeconds returns correct seconds for easy', () => {
  assert(difficultySeconds(DIFFICULTIES, 'easy') === 20, 'Easy should be 20s')
})

test('difficultySeconds returns correct seconds for medium', () => {
  assert(difficultySeconds(DIFFICULTIES, 'medium') === 15, 'Medium should be 15s')
})

test('difficultySeconds returns correct seconds for hard', () => {
  assert(difficultySeconds(DIFFICULTIES, 'hard') === 10, 'Hard should be 10s')
})

test('difficultySeconds returns 15 as fallback for unknown difficulty', () => {
  assert(
    difficultySeconds(DIFFICULTIES, 'unknown') === 15,
    'Unknown difficulty should default to 15s'
  )
})

// ── Questions data integrity ───────────────────────────────────────────────────

test('all questions have required fields', () => {
  QUESTIONS.forEach((q) => {
    assert(typeof q.id === 'number', `Question missing numeric id: ${JSON.stringify(q)}`)
    assert(
      typeof q.question === 'string' && q.question.length > 0,
      `Question ${q.id} has empty question text`
    )
    assert(
      Array.isArray(q.answers) && q.answers.length === 4,
      `Question ${q.id} must have exactly 4 answers`
    )
    assert(typeof q.correct === 'number', `Question ${q.id} missing correct index`)
    assert(typeof q.category === 'string', `Question ${q.id} missing category`)
  })
})

test('all questions have correct index in bounds', () => {
  QUESTIONS.forEach((q) => {
    assert(
      q.correct >= 0 && q.correct <= 3,
      `Question ${q.id} correct index out of bounds: ${q.correct}`
    )
  })
})

test('all question ids are unique', () => {
  const ids = QUESTIONS.map((q) => q.id)
  const unique = new Set(ids)
  assert(unique.size === ids.length, `Duplicate question IDs found`)
})

test('all question categories exist in CATEGORIES', () => {
  const validCats = new Set(CATEGORIES.map((c) => c.id).filter((id) => id !== 'mix'))
  QUESTIONS.forEach((q) => {
    assert(validCats.has(q.category), `Question ${q.id} has unknown category: ${q.category}`)
  })
})

test('at least 10 questions in bank', () => {
  assert(QUESTIONS.length >= 10, `Expected at least 10 questions, got ${QUESTIONS.length}`)
})

test('questions exist for every non-mix category', () => {
  const nonMixCategories = CATEGORIES.filter((c) => c.id !== 'mix')
  nonMixCategories.forEach((cat) => {
    const count = QUESTIONS.filter((q) => q.category === cat.id).length
    assert(count > 0, `No questions found for category: ${cat.id}`)
  })
})

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\nResults: ${passed} passed, ${failed} failed\n`)
process.exit(failed > 0 ? 1 : 0)
